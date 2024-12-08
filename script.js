let chartInstance = null; // Variable global para manejar la instancia del gráfico

// Función para obtener el valor de la UF desde la API
async function obtenerValorUF() {
  try {
    const response = await fetch("https://mindicador.cl/api/uf/08-12-2024");
    const data = await response.json();
    return data.serie[0].valor; // Retorna el valor actual de la UF
  } catch (error) {
    alert("Error al obtener el valor de la UF. Por favor, revise la conexión.");
    console.error(error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("calculateMortgage").addEventListener("click", async () => {
    const valorUF = await obtenerValorUF();
    if (!valorUF) return; // Detener ejecución si no se obtiene el valor de la UF

    // Obtén los valores del formulario
    const valorVivienda = parseFloat(document.getElementById("valorVivienda").value);
    const porcentajeBanco = parseFloat(document.getElementById("porcentajeBanco").value) / 100;
    const tasaInteres = parseFloat(document.getElementById("tasaInteres").value) / 100;
    const plazo = parseInt(document.getElementById("plazo").value) * 12; // Convertir años a meses
    const seguroDesgravamen = parseFloat(document.getElementById("seguroDesgravamen").value);
    const seguroIncendio = parseFloat(document.getElementById("seguroIncendio").value);

    // Validar campos
    if (
      isNaN(valorVivienda) ||
      isNaN(porcentajeBanco) ||
      isNaN(tasaInteres) ||
      isNaN(plazo) ||
      isNaN(seguroDesgravamen) ||
      isNaN(seguroIncendio)
    ) {
      alert("Por favor, complete todos los campos con valores válidos.");
      return;
    }

    // Cálculos principales
    const deuda = valorVivienda * porcentajeBanco; // Monto financiado por el banco
    const seguroTotalUF = seguroDesgravamen + seguroIncendio; // Suma de seguros en UF
    const dividendo = (deuda * (tasaInteres / 12)) / (1 - Math.pow(1 + tasaInteres / 12, -plazo)); // Fórmula del dividendo

    let totalIntereses = 0;
    let totalSeguros = Math.round(seguroTotalUF * plazo); // Redondear al entero más cercano

    const amortizationData = []; // Datos para la tabla y gráfico
    let balanceInicial = deuda;

    for (let i = 1; i <= plazo; i++) {
      const interes = balanceInicial * (tasaInteres / 12); // Interés mensual
      const amortizacion = dividendo - interes; // Amortización mensual
      const balanceFinal = balanceInicial - amortizacion; // Balance final

      totalIntereses += interes;

      amortizationData.push({
        mes: i,
        balanceInicial: balanceInicial.toFixed(2),
        interes: interes.toFixed(2),
        amortizacion: amortizacion.toFixed(2),
        dividendo: dividendo.toFixed(2),
        balanceFinal: balanceFinal.toFixed(2),
        seguro: seguroTotalUF.toFixed(2),
        dividendoConSeguro: (dividendo + seguroTotalUF).toFixed(2),
      });

      balanceInicial = balanceFinal;
    }

    // Cálculo del total a pagar
    const totalPagarUF = deuda + totalIntereses + totalSeguros; // Monto financiado + Intereses totales + Seguros
    const totalPagarCLP = Math.ceil(totalPagarUF * valorUF); // Redondear al mayor

    // Cálculo de la suma de intereses y seguros
    const sumaInteresesSegurosUF = totalIntereses + totalSeguros; // Suma en UF
    const sumaInteresesSegurosCLP = Math.ceil(sumaInteresesSegurosUF * valorUF); // Conversión a CLP redondeada

    // Cálculo de la suma total (vivienda + intereses + seguros)
    const sumaTotalUF = valorVivienda + totalIntereses + totalSeguros; // Valor de la vivienda + intereses + seguros
    const sumaTotalCLP = Math.ceil(sumaTotalUF * valorUF); // Conversión a CLP redondeada

    // Actualizar Resumen
    document.getElementById("valorViviendaUF").textContent = `${valorVivienda.toFixed(2)} UF`;
    document.getElementById("valorViviendaCLP").textContent = `${Math.ceil(valorVivienda * valorUF).toLocaleString('es-CL')} CLP`;

    document.getElementById("montoBancoUF").textContent = `${deuda.toFixed(2)} UF`;
    document.getElementById("montoBancoCLP").textContent = `${Math.ceil(deuda * valorUF).toLocaleString('es-CL')} CLP`;

    document.getElementById("plazoMesesUF").textContent = `${plazo} meses`;

    document.getElementById("totalInteresesUF").textContent = `${totalIntereses.toFixed(2)} UF`;
    document.getElementById("totalInteresesCLP").textContent = `${Math.ceil(totalIntereses * valorUF).toLocaleString('es-CL')} CLP`;

    document.getElementById("extraClienteUF").textContent = `${totalSeguros} UF`;
    document.getElementById("extraClienteCLP").textContent = `${Math.ceil(totalSeguros * valorUF).toLocaleString('es-CL')} CLP`;

    document.getElementById("sumaInteresesSegurosUF").textContent = `${sumaInteresesSegurosUF.toFixed(2)} UF`;
    document.getElementById("sumaInteresesSegurosCLP").textContent = `${sumaInteresesSegurosCLP.toLocaleString('es-CL')} CLP`;

    document.getElementById("totalPagarUF").textContent = `${totalPagarUF.toFixed(2)} UF`;
    document.getElementById("totalPagarCLP").textContent = `${totalPagarCLP.toLocaleString('es-CL')} CLP`;

    // Mostrar el total final (vivienda + intereses + seguros)
    document.getElementById("sumaTotalUF").textContent = `${sumaTotalUF.toFixed(2)} UF`;
    document.getElementById("sumaTotalCLP").textContent = `${sumaTotalCLP.toLocaleString('es-CL')} CLP`;

    // Llenar Tabla de Amortización
    const tableBody = document.getElementById("amortizationTableBody");
    tableBody.innerHTML = ""; // Limpiar tabla anterior
    amortizationData.forEach((data) => {
      const row = `
        <tr>
          <td>${data.mes}</td>
          <td>${data.balanceInicial}</td>
          <td>${data.interes}</td>
          <td>${data.amortizacion}</td>
          <td>${data.dividendo}</td>
          <td>${data.balanceFinal}</td>
          <td>${data.seguro}</td>
          <td>${data.dividendoConSeguro}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

    // Crear gráfico
    if (chartInstance) {
      chartInstance.destroy(); // Destruir gráfico anterior si existe
    }

    const ctx = document.getElementById("comparisonChart").getContext("2d");
    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: amortizationData.map((data) => data.mes), // Meses como etiquetas
        datasets: [
          {
            label: "Intereses (UF)",
            data: amortizationData.map((data) => parseFloat(data.interes)),
            borderColor: "#e74c3c",
            backgroundColor: "transparent",
            tension: 0.4,
          },
          {
            label: "Amortización (UF)",
            data: amortizationData.map((data) => parseFloat(data.amortizacion)),
            borderColor: "#2ecc71",
            backgroundColor: "transparent",
            tension: 0.4,
          },
          {
            label: "Seguros (UF)",
            data: amortizationData.map((data) => parseFloat(data.seguro)),
            borderColor: "#3498db",
            backgroundColor: "transparent",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Mes",
            },
          },
          y: {
            title: {
              display: true,
              text: "Monto (UF)",
            },
          },
        },
      },
    });
  });
});
