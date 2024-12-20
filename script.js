// Selección de elementos del DOM
const form = document.getElementById('cuentasForm');
const calcularBtn = document.getElementById('calcular');
const resultadoDiv = document.getElementById('resultado');

// Función para obtener valores del formulario
function obtenerValor(id) {
    const valor = document.getElementById(id).value;
    const numero = valor === '' ? 0 : parseFloat(valor);
    return isNaN(numero) ? 0 : numero;
}

// Función para convertir una fecha de texto a formato dd/mm/aaaa
function formatearFecha(fecha) {
    const meses = {
        "ene": "01", "feb": "02", "mar": "03", "abr": "04", "may": "05", "jun": "06",
        "jul": "07", "ago": "08", "sep": "09", "oct": "10", "nov": "11", "dic": "12"
    };
    const partesFecha = fecha.split(' ');
    if (partesFecha.length === 3) {
        const dia = partesFecha[0].replace(/[^\d]/g, ''); // Extrae el día
        const mes = meses[partesFecha[1].toLowerCase()]; // Extrae el mes
        const anio = partesFecha[2]; // Extrae el año
        return `${dia.padStart(2, '0')}/${mes}/${anio}`;
    }
    return fecha; // Si no se puede interpretar, devuelve el valor original
}

// Función para verificar si una fecha está en formato dd/mm/aaaa
function validarFormatoFecha(fecha) {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/; // Verifica formato dd/mm/aaaa
    return regex.test(fecha);
}

// Función para calcular el estado de cuenta
function calcularEstadoCuenta() {
    const periodoFacturacion = document.getElementById('periodoFacturacion').value || "No especificado";
    let fechaLimite = document.getElementById('fechaLimite').value || "No especificada";

    // Formatear las fechas ingresadas si es necesario
    let periodoFormateado = periodoFacturacion;
    if (periodoFacturacion.includes('-')) {
        const [inicio, fin] = periodoFacturacion.split('-').map(part => part.trim());
        periodoFormateado = `${formatearFecha(inicio)} - ${formatearFecha(fin)}`;
    }

    if (!validarFormatoFecha(fechaLimite)) {
        fechaLimite = formatearFecha(fechaLimite);
    }

    const pagoIntereses = obtenerValor('pagoIntereses');
    const pagoRecibido = obtenerValor('pagoRecibido');
    const cargosHechos = obtenerValor('cargosHechos');
    const mensualidadMSI = obtenerValor('mensualidadMSI');
    const pagoPendienteAnterior = obtenerValor('pagoPendienteAnterior');

    let mensaje = `En el estado de cuenta con periodo: <strong>${periodoFormateado}</strong>, `;
    let mensajeFinal = "";
    let montoTotal = pagoIntereses;

    // Escenarios basados en el pago recibido
    if (pagoRecibido > pagoIntereses) {
        const saldoAFavor = pagoRecibido - pagoIntereses;
        mensajeFinal = `pagaste <strong>$${pagoRecibido.toFixed(2)}</strong>, lo cual supera el pago requerido que era de <strong>$${pagoIntereses.toFixed(2)}</strong>, resultando en un pago a tu favor de <strong>$${saldoAFavor.toFixed(2)}</strong>. `;

        if (cargosHechos > 0) {
            if (saldoAFavor >= cargosHechos) {
                const saldoRestante = saldoAFavor - cargosHechos;
                mensajeFinal += `Realizaste cargos por <strong>$${cargosHechos.toFixed(2)}</strong>, y el pago a tu favor cubrió estos cargos, quedando un pago a tu favor de <strong>$${saldoRestante.toFixed(2)}</strong>.`;
            } else {
                const saldoPendientePorCargos = cargosHechos - saldoAFavor;
                mensajeFinal += `Realizaste cargos por <strong>$${cargosHechos.toFixed(2)}</strong>, y el pago a tu favor cubrió parte de estos cargos. Aún queda un pago pendiente de <strong>$${saldoPendientePorCargos.toFixed(2)}</strong> que deberás cubrir.`;
            }
        } else {
            mensajeFinal += `No realizaste nuevos cargos, por lo que el pago a tu favor de <strong>$${saldoAFavor.toFixed(2)}</strong> queda a tu favor.`;
        }
    } else if (pagoRecibido < pagoIntereses) {
        const montoPendiente = pagoIntereses - pagoRecibido;
        mensajeFinal = `Se te solicitó un pago para evitar intereses de <strong>$${pagoIntereses.toFixed(2)}</strong> con fecha límite de pago <strong>${fechaLimite}</strong>. `;
        mensajeFinal += `Pagaste <strong>$${pagoRecibido.toFixed(2)}</strong>, por lo que no completaste el pago necesario para evitar intereses. Queda un monto pendiente de <strong>$${montoPendiente.toFixed(2)}</strong>.`;

        if (pagoPendienteAnterior > 0) {
            mensajeFinal += `A este monto pendiente se le sumará el pago pendiente del estado anterior de <strong>$${pagoPendienteAnterior.toFixed(2)}</strong>. `;
        }

        if (cargosHechos > 0) {
            const totalConCargos = montoPendiente + cargosHechos;
            mensajeFinal += `Además, se sumarán los nuevos cargos realizados de <strong>$${cargosHechos.toFixed(2)}</strong>, dando un total a pagar en este periodo de <strong>$${totalConCargos.toFixed(2)}</strong>.`;
        }
    } else {
        mensajeFinal = `Pagaste <strong>$${pagoRecibido.toFixed(2)}</strong>, lo cual cubre el pago solicitado, quedando un saldo a favor o un pago cero.`;
    }

    // Mostrar el resultado
    resultadoDiv.innerHTML = mensaje + mensajeFinal;
}

// Evento del botón calcular
calcularBtn.addEventListener('click', calcularEstadoCuenta);
