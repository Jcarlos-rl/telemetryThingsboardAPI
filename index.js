const btn_request = document.querySelector('#btn_request'),
    urlServer = document.querySelector('#urlServer'),
    token = document.querySelector('#token'),
    entityType = document.querySelector('#entityType'),
    entityId = document.querySelector('#entityId'),
    keys = document.querySelector('#keys'),
    startDay = document.querySelector('#startDay'),
    endDay = document.querySelector('#endDay'),
    content_feedback = document.querySelector('#content_feedback'),
    btn_download = document.querySelector('#btn_download'),
    backdrop = document.querySelector('#backdrop')
    ;

let newData = {}, endDayMil = 0;
btn_request.addEventListener('click', ()=>{
    backdrop.classList.remove('hidden');
    const startDayMil = convertDateToMilliseconds(new Date(startDay.value));
    endDayMil = (endDayMil === 0) ? convertDateToMilliseconds(new Date(endDay.value)) : endDayMil;
    let url = `${ urlServer.value }/api/plugins/telemetry/${ entityType.value }/${ entityId.value }/values/timeseries?keys=${ keys.value }&startTs=${ startDayMil }&endTs=${ endDayMil }&limit=1000`;
    fetchData(token.value, url).then(data=>{
        console.log(data);
        return;
        backdrop.classList.add('hidden');
        if(Object.keys(data).length === 0){
            let startDayMilLocale = new Date(endDayMil), 
                endDayMilLocale = new Date(convertDateToMilliseconds(new Date(endDay.value))),
                prevContent = content_feedback.innerHTML;
            content_feedback.innerHTML = `<p class="mb-4 text-green-600">Se obtubieron un total de ${ Object.keys(newData).length } registros en el rango de ${ startDayMilLocale.toLocaleString() } al ${ endDayMilLocale.toLocaleString() }.</p>`;
            content_feedback.innerHTML += prevContent;
        }else{
            let countNewData = Object.keys(newData);
            let endTs = [];
            for (const key in data) {
                if(data.hasOwnProperty(key)){
                    if(endTs.length > 0){
                        if(!endTs.includes(data[key][data[key].length-1].ts)){
                            endTs.push(data[key][data[key].length-1].ts);
                        }
                    }else{
                        endTs.push(data[key][data[key].length-1].ts);
                    }
                    data[key].forEach(element => {
                        if(!newData[element.ts]){
                            newData[element.ts] = {};
                        }
                        newData[element.ts][key] = element.value;
                    });
                }
            }
            let prevEndDayMil = endDayMil;
            endDayMil = (endTs.length>1) ? (Math.min(endTs)) : endTs[0];
            let endDayMilLocale = new Date(endDayMil),
                prevEndDayMilLocale = new Date(prevEndDayMil),
                prevContent = content_feedback.innerHTML;
            content_feedback.innerHTML = `<p class="mb-4">Se obtubieron ${ Object.keys(newData).length - countNewData.length } registros en un rango de fechas de ${ endDayMilLocale.toLocaleString() } al ${ prevEndDayMilLocale.toLocaleString() }. Llevando un total de ${ Object.keys(newData).length } registros.</p>`;
            content_feedback.innerHTML += prevContent;
            setTimeout(() => {
                btn_request.click();
            }, 2000);
        }
    });
});

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

const fetchData = async(accessToken, url)=>{
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(url, requestOptions);
    const data = await response.json();

    return data;
}

const generateJSONFile = ()=>{
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(newData));
    let dlAnchorElem = document.getElementById('btn_download');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "data.json");
}

const getToken = ()=>{
    let formData = new FormData();

    formData.append("username", "juan.romero@tesamerica.com.mx");
    formData.append("password", "Carlos-181213");

    fetch("https://tb04.tkmecloud.io/api/auth/login",{
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'juan.romero@tesamerica.com.mx',
            password: 'Carlos-181213'
        })
    })
    .then(res => res.json())
    .then(data=>{
        console.log(data);
    })
}

//getToken();