use hyper::{
    service::{make_service_fn, service_fn},
    Body, Request, Response, Server,
};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::{sync::Arc, thread, time::Duration};
use tokio::sync::{oneshot, Mutex};

lazy_static! {
    static ref SHUTDOWN_SIGNAL: Mutex<Option<oneshot::Sender<()>>> = Mutex::new(None);
}

#[derive(Debug)]
struct TokenStruct {
    pub user_id: Option<String>,
    pub access_token: Option<String>,
}

unsafe impl Send for TokenStruct {}
unsafe impl Sync for TokenStruct {}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthInfo {
    pub user_id: String,
    pub access_token: String,
}

async fn handle_request(
    req: Request<Body>,
    tokens: Arc<Mutex<TokenStruct>>,
) -> Result<Response<Body>, hyper::Error> {
    let url = req.uri();
    let query_params: Vec<_> = url.query().unwrap_or_default().split('&').collect();

    let mut tokens_guard = tokens.lock().await;

    for param in query_params {
        let key_value: Vec<_> = param.split('=').collect();
        if key_value.len() == 2 {
            match key_value[0] {
                "user_id" => tokens_guard.user_id = Some(key_value[1].to_string()),
                "access_token" => tokens_guard.access_token = Some(key_value[1].to_string()),
                _ => {}
            }
        }
    }

    // 收到认证信息后，发送关闭信号
    if let Some(sender) = SHUTDOWN_SIGNAL.lock().await.take() {
        let _ = sender.send(());
    }

    Ok(Response::new(Body::from(
        "You have successfully signed into Yogu and can close this at any time.",
    )))
    // 也可以 302 跳转到 https://yogu.pro/auth/login/native_app_success
}

pub async fn auth() -> Result<AuthInfo, String> {
    // 如果存在之前的关闭信号，先发送关闭信号
    if let Some(sender) = SHUTDOWN_SIGNAL.lock().await.take() {
        let _ = sender.send(());
        // 给一点时间让之前的服务器完全关闭
        tokio::time::sleep(Duration::from_millis(100)).await;
    }

    let token_struct = Arc::new(Mutex::new(TokenStruct {
        user_id: None,
        access_token: None,
    }));

    let tokens = token_struct.clone();
    let addr = ([127, 0, 0, 1], 0).into();

    // 创建关闭信号通道
    let (shutdown_tx, shutdown_rx) = oneshot::channel();
    *SHUTDOWN_SIGNAL.lock().await = Some(shutdown_tx);

    let make_svc = make_service_fn(move |_conn| {
        let tokens = tokens.clone();
        async { Ok::<_, hyper::Error>(service_fn(move |req| handle_request(req, tokens.clone()))) }
    });

    let server = Server::bind(&addr).serve(make_svc);
    let actual_addr = server.local_addr();

    // 添加优雅关闭机制
    let graceful = server.with_graceful_shutdown(async {
        shutdown_rx.await.ok();
    });

    let user_consent_url = format!(
        "https://yogu.pro/auth/login/native_app?native_app_port={}",
        actual_addr.port()
    );
    println!("{}", user_consent_url);

    webbrowser::open(&user_consent_url).unwrap();

    // 在后台运行服务器，并等待它完成
    tokio::spawn(graceful);

    // 等待认证完成
    let mut end = false;
    while !end {
        let val = token_struct.lock().await;
        if val.user_id.is_some() && val.access_token.is_some() {
            end = true;
        }
        std::mem::drop(val);
        thread::sleep(Duration::from_secs(1));
    }

    let val = token_struct.lock().await;

    Ok(AuthInfo {
        user_id: val.user_id.clone().unwrap(),
        access_token: val.access_token.clone().unwrap(),
    })
}
