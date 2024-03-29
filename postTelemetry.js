const archivo = document.querySelector('#archivo');
let contentJson = '';

btn_save.addEventListener('click', async()=>{
    if(entityType.value.trim() === '' || entityId.value.trim() === '' || archivo.files[0] === undefined){
        let error = 'Los siguientes campos no pueden estar vacios: </br>';

        if(entityType.value.trim() === ''){
            error += '-entityType </br>';
        }

        if(entityId.value.trim() === ''){
            error += '-entityID </br>';
        }

        if(archivo.files[0] === undefined){
            error += '-Archivo .json</br>';
        }

        alert_get_telemetria_p.innerHTML = error;
        alert_get_telemetria.classList.remove('hidden');
        return;
    }

    try{
        contentJson = await readFile(archivo.files[0]);
    }catch(err){
        console.log(err);
    }

    const entityType_value = entityType.value.trim(),
        entityId_value = entityId.value.trim();

    let url = `${ serversList[servidorKey] }api/plugins/telemetry/${ entityType_value }/${ entityId_value }/timeseries/ANY?scope=ANY`;

    postTelemetry(url, contentJson).then(data=>{
        if(data){
            content_feedback.innerHTML = `<p class="mb-4 text-green-600">Se guardaron los datos con éxito.</p>`;
        }
    });
});

const postTelemetry = async(url, data)=>{
    const dataJson = JSON.stringify(data),
        requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: dataJson
    };

    const response = await fetch(url, requestOptions);
    
    if(response.status >= 200 && response.status < 300){
        return true;
    }else{
        setTimeout(() => {
            closeSesion();
        }, 1000);
    }
}


const readFile = async(file)=>{
    const reader = new FileReader();

    reader.readAsText(file);
    return new Promise((res, rej) =>{
        reader.onload = function(e){
            const content = e.target.result;
            try{
                res(JSON.parse(content));
            }catch(err){
                rej(err);
            }
        }
    })
}