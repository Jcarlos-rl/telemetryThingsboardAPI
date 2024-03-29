const entityType = document.querySelector('#entityType'),
    entityId = document.querySelector('#entityId'),
    keys = document.querySelector('#keys'),
    startDay = document.querySelector('#startDay'),
    endDay = document.querySelector('#endDay'),
    alert_get_telemetria_p = document.querySelector('#alert_get_telemetria p')
    ;

let newData = {}, endDayMil = 0;
btn_request.addEventListener('click', ()=>{
    showBackdrop(true, "Obteniendo información...");
    if(entityType.value.trim() === '' || entityId.value.trim() === '' || keys.value.trim() === '' || startDay.value.trim() === '' || endDay.value.trim() === ''){
        let error = 'Los siguientes campos no pueden estar vacios: </br>';

        if(entityType.value.trim() === ''){
            error += '-entityType </br>';
        }

        if(entityId.value.trim() === ''){
            error += '-entityID </br>';
        }

        if(keys.value.trim() === ''){
            error += '-Claves de la telemetría </br>';
        }

        if(startDay.value.trim() === ''){
            error += '-Fecha de inicio </br>';
        }

        if(endDay.value.trim() === ''){
            error += '-Fecha de fin </br>';
        }

        alert_get_telemetria_p.innerHTML = error;
        alert_get_telemetria.classList.remove('hidden');
        showBackdrop(false);
        return;
    }

    const entityType_value = entityType.value.trim(),
        entityId_value = entityId.value.trim(),
        keys_value = keys.value.trim(),
        startDay_value = startDay.value.trim(),
        endDay_value = endDay.value.trim(),
        startDay_TS = convertDateToMilliseconds(new Date(startDay_value)),
        endDay_TS = convertDateToMilliseconds(new Date(endDay_value));
    
    endDayMil = (endDayMil === 0) ? endDay_TS : endDayMil;
    let url = `${ serversList[servidorKey] }api/plugins/telemetry/${ entityType_value }/${ entityId_value }/values/timeseries?keys=${ keys_value }&startTs=${ startDay_TS }&endTs=${ endDayMil }&limit=1000`;

    getTelemetry(url, token).then(data=>{
        if(data !== undefined){
            if(Object.keys(data).length === 0){
                let startDayMilLocale = new Date(endDayMil), 
                    endDayMilLocale = new Date(convertDateToMilliseconds(new Date(endDay_value))),
                    prevContent = content_feedback.innerHTML;
                content_feedback.innerHTML = `<p class="mb-4 text-green-600">Se obtubieron un total de ${ Object.keys(newData).length } registros en el rango de ${ startDayMilLocale.toLocaleString() } al ${ endDayMilLocale.toLocaleString() }.</p>`;
                content_feedback.innerHTML += prevContent;
                newData = Object.values(newData);
                btn_download.classList.remove('pointer-events-none');
                showBackdrop(false);
            }else{
                let countNewData = Object.keys(newData),
                    endTs = [];

                Object.keys(data).forEach(sensorKey =>{
                    data[sensorKey].forEach(entry=>{
                        if(!newData[entry.ts]){
                            newData[entry.ts] = {ts: entry.ts, values: {}};
                            endTs.push(entry.ts);
                        }
                        newData[entry.ts].values[sensorKey] = entry.value;
                    })
                });

                let prevEndDayMil = endDayMil;
                endDayMil = endTs[endTs.length-1];

                let endDayMilLocale = new Date(endDayMil),
                    prevEndDayMilLocale = new Date(prevEndDayMil),
                    prevContent = content_feedback.innerHTML;
                
                content_feedback.innerHTML = `<p class="mb-4">Se obtubieron ${ Object.keys(newData).length - countNewData.length } registros en un rango de fechas de ${ endDayMilLocale.toLocaleString() } al ${ prevEndDayMilLocale.toLocaleString() }. Llevando un total de ${ Object.keys(newData).length } registros.</p>`;
                content_feedback.innerHTML += prevContent;
                setTimeout(() => {
                    btn_request.click();
                }, 1000);
            }

        }
    })
    alert_get_telemetria.classList.add('hidden');
});

const getTelemetry = async(url, token)=>{
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    try{
        const response = await fetch(url, requestOptions);
        const dataResponse = await response.json();
    
        if(response.status >= 200 && response.status < 300){
            return dataResponse;
        }else{
            alert_get_telemetria_p.innerText = dataResponse.message;
            alert_get_telemetria.classList.remove('hidden');
            setTimeout(() => {
                closeSesion();
            }, 1000);
        }
    } catch(err){
        let message = 'Lo sentimos, ocurrio un error inesperado.';
        if(/Device/.test(err) || /Asset/.test(err)){
            message = `Lo sentimos, el ${(/Device/.test(err)) ? 'dispositivo' : 'activo'} no es valido.`;
        }
        alert_get_telemetria_p.innerText = message;
        alert_get_telemetria.classList.remove('hidden');
        showBackdrop(false);
    }
}

btn_download.addEventListener('click', ()=>{
    generateJSONFile();
});

const convertDateToMilliseconds = (dateInput)=>{
    const dateUTC = Date.UTC(
        dateInput.getUTCFullYear(),
        dateInput.getUTCMonth(),
        dateInput.getUTCDate(),
        dateInput.getUTCHours(),
        dateInput.getUTCMinutes(),
        dateInput.getUTCSeconds(),
        dateInput.getUTCMilliseconds()
    );

    return dateUTC;
}

const generateJSONFile = ()=>{
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(newData));
    let dlAnchorElem = document.getElementById('btn_download');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "data.json");

    newData = {};
    endDayMil = 0;
    content_feedback.innerHTML = "";
}