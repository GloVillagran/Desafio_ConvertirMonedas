document.getElementById('convertirBtn').addEventListener('click', realizarConversion);

async function realizarConversion() {
    const monto = parseFloat(document.getElementById('monto').value);
    const monedaDestino = document.getElementById('monedaDestino').value;

    try {
        // Valida que se haya ingresado un monto
        if (isNaN(monto)) {
            document.getElementById('resultado').innerHTML = 'Ingrese un valor válido.';
            return;
        }

        const response = await fetch(`https://mindicador.cl/api/${monedaDestino}`);
        const data = await response.json();

        if (data.serie && data.serie.length > 0) {
            // Obtiene el último valor de la serie
            const ultimoValor = data.serie[data.serie.length - 1].valor;

            const cambio = monto / ultimoValor;

            mostrarResultado(cambio, monedaDestino);

            // Dibuja el gráfico 
            dibujarGrafico(data.serie);
            document.getElementById('graficoContainer').classList.add('con-borde');
        } else if (data.codigo && data.valor) {
            // Verifica si la respuesta contiene el código y el valor
            const valorMoneda = monedaDestino === 'dolar' ? data.dolar.valor : data.valor;

            const cambio = monto / valorMoneda;

            mostrarResultado(cambio, monedaDestino);

            // Agrega el borde rojo al contenedor
            document.getElementById('graficoContainer').classList.add('con-borde');
        } else {
            document.getElementById('resultado').innerHTML = `No se encontraron datos válidos para ${monedaDestino}.`;
        }
    } catch (error) {
        document.getElementById('resultado').innerHTML = `Error al cargar los datos: ${error.message}`;
    }
}

function mostrarResultado(cambio, monedaDestino) {
    document.getElementById('resultado').innerHTML = `Cambio: ${cambio.toFixed(2)} ${monedaDestino.toUpperCase()}`;
}

function dibujarGrafico(serie) {
    // Obtiene el contenedor del gráfico
    const contenedorGrafico = document.getElementById('graficoContainer');

    // Tuve que agregar porque el gráfico aumentaba infinitamente de tamaño. 
    while (contenedorGrafico.firstChild) {
        contenedorGrafico.removeChild(contenedorGrafico.firstChild);
    }

    // Limita la serie a los últimos 10 días
    const ultimos10Dias = serie.slice(-10);

    // Crea un nuevo lienzo para el gráfico
    const nuevoCanvas = document.createElement('canvas');
    nuevoCanvas.id = 'historialChart';
    contenedorGrafico.appendChild(nuevoCanvas);

    // Dibuja el gráfico en el nuevo lienzo
    const ctx = nuevoCanvas.getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ultimos10Dias.map(dia => new Date(dia.fecha).toLocaleDateString()),
            datasets: [{
                label: 'Historial de Valor',
                data: ultimos10Dias.map(dia => dia.valor),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: [{
                    type: 'category',
                    labels: ultimos10Dias.map(dia => new Date(dia.fecha).toLocaleDateString()),
                    offset: true,
                }],
                y: {
                    title: {
                        display: true,
                        text: 'Valor',
                    },
                },
            },
        },
    });
}
