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
      .then(response => {
        console.log('✅ Planes:', response);
        planSelect.innerHTML = '<option value="">Selecciona un plan...</option>';

        // El backend devuelve { success: true, data: [...] }
        const planes = response.success ? response.data : response;

        if (Array.isArray(planes) && planes.length > 0) {
          planes.forEach(plan => {
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

  // Validar teléfono - acepta formatos: 584147979209, +584147979209, 0414-7979209
  function validarTelefono(phone) {
    // Eliminar espacios, guiones y paréntesis
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Aceptar: 10-15 dígitos (formato local o internacional)
    return /^[0-9]{10,15}$/.test(cleaned);
  }

  // Formatear teléfono para el backend (agregar +58 si es necesario)
  function formatearTelefono(phone) {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Si empieza con 58 y tiene 12 dígitos, agregar +
    if (/^58[0-9]{10}$/.test(cleaned)) {
      return '+' + cleaned;
    }
    // Si ya empieza con +58, dejarlo como está
    if (/^\+58[0-9]{10}$/.test(phone)) {
      return phone;
    }
    // Si es formato local (10 dígitos empezando con 0), convertir a internacional
    if (/^0[0-9]{9}$/.test(cleaned)) {
      return '+58' + cleaned.substring(1);
    }
    // Si empieza con 58 pero no tiene el formato correcto, agregar +
    if (/^58[0-9]+$/.test(cleaned)) {
      return '+' + cleaned;
    }
    // Por defecto, retornar con +
    return '+' + cleaned;
  }

  // Cargar planes
  cargarPlanes();

  // Enviar formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = form.phone.value.trim();
    const planId = form.plan.value;

    if (!validarTelefono(phone)) {
      statusDiv.textContent = '❌ Teléfono inválido. Use: 584147979209 o 0414-7979209';
      statusDiv.className = 'status-message error';
      return;
    }

    if (!planId) {
      statusDiv.textContent = '❌ Selecciona un plan';
      statusDiv.className = 'status-message error';
      return;
    }

    // Formatear teléfono para el backend
    const phoneFormatted = formatearTelefono(phone);

    submitBtn.disabled = true;
    statusDiv.textContent = '⏳ Procesando...';
    statusDiv.className = 'status-message info';

    try {
      const res = await fetch('/api/v1/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneFormatted, plan_id: planId })
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