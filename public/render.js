const header = document.querySelector(":root");
let header_timeout = false;
document.addEventListener('scroll', (e) => {
    if(!header_timeout){
        header_timeout = true;
        requestAnimationFrame(()=>{
            header.style.setProperty("--hide-percent", String(Math.min(window.scrollY / window.innerHeight * 800,100)))
            header_timeout = false;
        });
    }

})