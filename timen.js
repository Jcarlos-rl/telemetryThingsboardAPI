// Definir una variable para almacenar el tiempo de la última notificación enviada
let ultimoTiempoNotificacion = null;

// Función para enviar la notificación al usuario
function enviarNotificacion() {
    console.log("Se envió una notificación al usuario");
    // Aquí pondrías tu lógica para enviar la notificación real al usuario
}

// Función para manejar la recepción de una actualización
function recibirActualizacion() {
    const ahora = Date.now();
    console.log(ultimoTiempoNotificacion);
    console.log(ahora);
    
    // Verificar si ha pasado al menos 5 minutos desde la última notificación
    if (!ultimoTiempoNotificacion || (ahora - ultimoTiempoNotificacion) >= 1 * 60 * 1000) {
        console.log('entre');
        // Si han pasado 5 minutos o es la primera notificación, enviar una nueva notificación
        enviarNotificacion();
        // Actualizar el tiempo de la última notificación
        ultimoTiempoNotificacion = ahora;
    } else {
        // Si han pasado menos de 5 minutos desde la última notificación, no hacer nada
        console.log("Se recibió una actualización pero aún no ha pasado el tiempo suficiente para enviar otra notificación");
    }
}

// Simular la recepción de varias actualizaciones
// Aquí deberías llamar a recibirActualizacion() cada vez que recibas una actualización
// Para este ejemplo, lo simularemos llamando a la función varias veces seguidas
setTimeout(recibirActualizacion, 1000); // Simulamos una actualización después de 1 segundo
setTimeout(recibirActualizacion, 1000); // Simulamos otra actualización después de 1 segundo
setTimeout(recibirActualizacion, 1000); // Simulamos otra actualización después de 1 segundo