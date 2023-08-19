const nav = document.querySelector(".navbar");
function check_scroll() {
    let n = 1 - window.scrollY / 200;
    n = Math.min(1 , Math.max(0, n));
    nav.style.setProperty("--n", n);
    requestAnimationFrame(check_scroll);
}
requestAnimationFrame(check_scroll);