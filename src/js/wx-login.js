!function (a, b) {
  function d(a, x, y) {
    let sr = "default";
    if (a.self_redirect === true) {
      sr = "true";
    } else if (a.self_redirect === false) {
      sr = "false";
    }
    let e = "https://open.weixin.qq.com/connect/qrconnect?appid=" + a.appid
      + "&scope=" + a.scope + "&redirect_uri=" + a.redirect_uri + "&state=" + a.state
      + "&login_type=jssdk&self_redirect=" + sr + '&styletype=' + (a.styletype || '')
      + '&sizetype=' + (a.sizetype || '') + '&bgcolor=' + (a.bgcolor || '') + '&rst=' + (a.rst || '');
    e += a.style ? "&style=" + a.style : "";
    e += a.href ? "&href=" + a.href : "";

    let d = b.createElement("iframe");
    d.src = e;
    d.frameBorder = "0";
    d.allowTransparency = "true";
    d.scrolling = "no";
    d.width = x ? (300 + x) : 300 + "px";
    d.height = (y || x) ? (400 + (y || x)) : 400 + "px";
    let f = b.getElementById(a.id);
    f.innerHTML = "";
    f.appendChild(d);
  }

  a.WxLogin = d;
}(window, document);
