document.addEventListener('DOMContentLoaded', () => {
  const planSelect = document.getElementById('plan');
  const form = document.getElementById('access-form');
  const statusDiv = document.getElementById('status');

  // Cargar planes desde el backend
  fetch('/api/v1/plans')
    .then(res => res.json())
    .then(data => {
      data.forEach(plan => {
        const opt = document.createElement('option');
        opt.value = plan.id;
        opt.textContent = `${plan.name} - Bs ${plan.price}`;
        planSelect.appendChild(opt);
      });
    })
    .catch(() => {
      statusDiv.textContent = 'No se pudieron cargar los planes.';
    });

  // Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusDiv.textContent = 'Procesando pago...';
    const phone = form.phone.value;
    const planId = form.plan.value;
    try {
      const res = await fetch('/api/v1/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, planId })
      });
      const result = await res.json();
      if (res.ok && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else if (result.message) {
        statusDiv.textContent = result.message;
      } else {
        statusDiv.textContent = 'Error procesando el pago.';
      }
    } catch (err) {
      statusDiv.textContent = 'Error de conexión.';
    }
  });
});