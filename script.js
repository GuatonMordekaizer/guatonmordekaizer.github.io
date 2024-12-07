let chartInstance = null; // Variable global para manejar la instancia del gráfico

document.getElementById("calculateMortgage").addEventListener("click", () => {
  const valorVivienda = parseFloat(document.getElementById("valorVivienda").value);
  const porcentajeBanco = parseFloat(document.getElementById("porcentajeBanco").value) / 100;
  const tasaInteres = parseFloat(document.getElementById("tasaInteres").value) / 100;
  const plazo = parseInt(document.getElementById("plazo").value) * 12; // Convertir años a meses
  const seguroDesgravamen = parseFloat(document.getElementById("seguroDesgravamen").value);
  const seguroIncendio = parseFloat(document.getElementById("seguroIncendio").value);

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

  const deuda = valorVivienda * porcentajeBanco; // Monto financiado por el banco
  const seguroTotal = seguroDesgravamen + seguroIncendio; // Suma de seguros
  const dividendo = (deuda * (tasaInteres / 12)) / (1 - Math.pow(1 + tasaInteres / 12, -plazo)); // Fórmula del dividendo

  let balanceInicial = deuda;
  const amortizationData = [];
  let totalIntereses = 0;

  for (let i = 1; i <= plazo; i++) {
    const interes = balanceInicial * (tasaInteres / 12); // Interés mensual
    const amortizacion = dividendo - interes; // Amortización mensual
    const balanceFinal = balanceInicial - amortizacion; // Balance final

    totalIntereses += interes; // Sumar los intereses totales

    amortizationData.push({
      mes: i,
      balanceInicial: balanceInicial.toFixed(2),
      interes: interes.toFixed(2),
      amortizacion: amortizacion.toFixed(2),
      dividendo: dividendo.toFixed(2),
      balanceFinal: balanceFinal.toFixed(2),
      seguro: seguroTotal.toFixed(2),
      dividendoConSeguro: (dividendo + seguroTotal).toFixed(2),
    });

    balanceInicial = balanceFinal; // Actualizar el balance inicial para la próxima cuota
  }

  // Actualizar Resumen
  document.getElementById("valorViviendaResumen").textContent = valorVivienda.toFixed(2);
  document.getElementById("montoBancoResumen").textContent = deuda.toFixed(2);
  document.getElementById("plazoResumen").textContent = plazo;
  document.getElementById("totalInteresesResumen").textContent = totalIntereses.toFixed(2);

  // Llenar Tabla
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

  // Gráfico: Destruir instancia anterior si existe
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Crear un nuevo gráfico
  const ctx = document.getElementById("comparisonChart").getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: amortizationData.map((d) => d.mes), // Meses como etiquetas
      datasets: [
        {
          label: "Interés",
          data: amortizationData.map((d) => parseFloat(d.interes)),
          borderColor: "#e74c3c",
          backgroundColor: "transparent",
          tension: 0.4,
        },
        {
          label: "Amortización",
          data: amortizationData.map((d) => parseFloat(d.amortizacion)),
          borderColor: "#2ecc71",
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
