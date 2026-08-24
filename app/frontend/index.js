console.log('✅ Script cargado');

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM Cargado');
  
  const planSelect = document.getElementById('plan');
  const form = document.getElementById('access-form');
  const statusDiv = document.getElementById('status');
  const submitBtn = document.getElementById('submit-btn');

  // Cargar planes
  function cargarPlanes() {
    statusDiv.textContent = '⏳ Cargando planes...';
    statusDiv.className = 'status-message info';

    fetch('/api/v1/plans')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('✅ Planes:', data);
        planSelect.innerHTML = '<option value="">Selecciona un plan...</option>';
        
        if (Array.isArray(data) && data.length > 0) {
          data.forEach(plan => {
            const opt = document.createElement('option');
            opt.value = plan.id;
            opt.textContent = `${plan.name} - Bs ${plan.price}`;
            planSelect.appendChild(opt);
          });
          statusDiv.textContent = '✅ Planes cargados';
          statusDiv.className = 'status-message success';
        } else {
          statusDiv.textContent = '⚠️ No hay planes disponibles';
          statusDiv.className = 'status-message warning';
        }
        
        setTimeout(() => statusDiv.textContent = '', 3000);
      })
      .catch(err => {
        console.error('❌ Error:', err);
        statusDiv.textContent = '❌ Error cargando planes';
        statusDiv.className = 'status-message error';
      });
  }

  // Validar teléfono
  function validarTelefono(phone) {
    return /^[0-9\-]{10,15}$/.test(phone);
  }

  // Cargar planes
  cargarPlanes();

  // Enviar formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = form.phone.value.trim();
    const planId = form.plan.value;

    if (!validarTelefono(phone)) {
      statusDiv.textContent = '❌ Teléfono inválido (ej: 0414-1234567)';
      statusDiv.className = 'status-message error';
      return;
    }

    if (!planId) {
      statusDiv.textContent = '❌ Selecciona un plan';
      statusDiv.className = 'status-message error';
      return;
    }

    submitBtn.disabled = true;
    statusDiv.textContent = '⏳ Procesando...';
    statusDiv.className = 'status-message info';

    try {
      const res = await fetch('/api/v1/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, planId })
      });

      const result = await res.json();

      if (res.ok) {
        statusDiv.textContent = '✅ Pago iniciado';
        statusDiv.className = 'status-message success';
        
        if (result.paymentUrl) {
          setTimeout(() => window.location.href = result.paymentUrl, 1500);
        }
      } else {
        statusDiv.textContent = '❌ ' + (result.message || 'Error');
        statusDiv.className = 'status-message error';
      }
    } catch (err) {
      console.error('Error:', err);
      statusDiv.textContent = '❌ Error de conexión';
      statusDiv.className = 'status-message error';
    } finally {
      submitBtn.disabled = false;
    }
  });
});