const login = document.querySelector('#login'),
    alert_login = document.querySelector('#alert_login');

login.addEventListener('submit', (e)=>{
    e.preventDefault();
    showBackdrop(true, "Iniciando sesión...");

    let myFormData = new FormData(login);

    servidorKey = myFormData.get("servidor");

    let usuario = myFormData.get("email").trim(),
        pass = myFormData.get("password").trim(),
        servidor = serversList[servidorKey];

    getToken(servidor, usuario, pass).then(data=>{
        if(data !== undefined){
            showBackdrop(false);
            alert_login.classList.add('hidden');
            token = data.token;
            urlServer.value = servidor;
            localStorage.setItem("token_apithingsboard", token);
            localStorage.setItem("servidor_apithingsboard", servidorKey);
            login_modal.classList.add('hidden');
        }
    })
});

const getToken = async(server, username, password)=>{

    const data = JSON.stringify({
        username,
        password
    }),
    url = `${ server }api/auth/login`,
    requestOptions = {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    },
    response = await fetch(url, requestOptions),
    dataResponse = await response.json();

    if(response.status >= 200 && response.status < 300){
        return dataResponse;
    }else{
        alert_login.classList.remove('hidden');
        document.querySelector('#alert_login p').innerText = dataResponse.message;
        showBackdrop(false);
    }
}