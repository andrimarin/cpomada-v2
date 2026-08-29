/**
 * EJEMPLO DE MODIFICACIONES AL FRONTEND (index.js)
 * Para integrar con sistema de pagos Bancomercantil
 */

// ============================================================
// 1. CARGAR PLANES AL INICIAR EL PORTAL
// ============================================================

async function loadAvailablePlans() {
    try {
        const response = await fetch('/api/v1/plans');
        const data = await response.json();
        
        if (!data.success || data.data.length === 0) {
            console.error('No planes disponibles');
            return;
        }

        const plansContainer = document.getElementById('plans-container');
        const planSelect = document.getElementById('plan-select');
        
        // Limpiar opciones previas
        planSelect.innerHTML = '<option value="">-- Seleccione un Plan --</option>';
        
        // Agregar planes como opciones
        data.data.forEach(plan => {
            const option = document.createElement('option');
            option.value = plan.id;
            option.textContent = `${plan.name} - Bs ${parseFloat(plan.price).toFixed(2)} (${plan.hours}h)`;
            option.dataset.price = plan.price;
            option.dataset.hours = plan.hours;
            planSelect.appendChild(option);
        });
        
        // Mostrar container
        if (plansContainer) {
            plansContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('Error cargando planes:', error);
        document.getElementById('oper-hint').innerHTML = 
            'Error al cargar los planes disponibles';
    }
}

// ============================================================
// 2. VALIDAR NÚMERO DE TELÉFONO
// ============================================================

function validatePhoneNumber(phone) {
    // Formato esperado: +584XX-XXXXXXX o 04XX-XXXXXXX
    const phoneRegex = /^(\+58|0)[0-9]{10}$/;
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    if (!phoneRegex.test(cleaned)) {
        return { valid: false, message: 'Formato inválido. Ej: +584120000000' };
    }
    
    return { valid: true, formatted: cleaned };
}

// ============================================================
// 3. MOSTRAR FORMULARIO DE PAGO
// ============================================================

function showPaymentForm() {
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.style.display = 'block';
    }
}

// ============================================================
// 4. PROCESAR PAGO MÓVIL
// ============================================================

async function processMobilePayment() {
    try {
        // Obtener valores
        const planId = document.getElementById('plan-select').value;
        const phoneNumber = document.getElementById('phone-number').value;
        const clientMac = getQueryStringKey('clientMac');
        const apMac = getQueryStringKey('apMac');
        
        // Validaciones
        if (!planId) {
            showError('Por favor seleccione un plan');
            return;
        }
        
        if (!phoneNumber) {
            showError('Por favor ingrese su número telefónico');
            return;
        }
        
        const phoneValidation = validatePhoneNumber(phoneNumber);
        if (!phoneValidation.valid) {
            showError(phoneValidation.message);
            return;
        }
        
        if (!clientMac) {
            showError('No se pudo detectar su dispositivo. Intente nuevamente.');
            return;
        }
        
        // Mostrar estado
        document.getElementById('oper-hint').innerHTML = 
            '⏳ Procesando su pago, por favor espere...';
        document.getElementById('oper-hint').style.display = 'block';
        
        // Enviar solicitud de pago
        const response = await fetch('/api/v1/payments/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone_number: phoneValidation.formatted,
                plan_id: parseInt(planId),
                client_mac: clientMac,
                ap_mac: apMac,
                gateway_mac: getQueryStringKey('gatewayMac'),
                ssid_name: getQueryStringKey('ssidName'),
                radio_id: getQueryStringKey('radioId'),
                vid: getQueryStringKey('vid'),
                origin_url: getQueryStringKey('originUrl')
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            showError(`Error: ${result.message || 'Error al procesar el pago'}`);
            return;
        }
        
        // Pago iniciado exitosamente
        const transactionId = result.transactionId;
        const plan = result.plan;
        
        document.getElementById('oper-hint').innerHTML = 
            `✅ Pago iniciado exitosamente!<br>` +
            `Transacción: ${transactionId}<br>` +
            `Cantidad: Bs ${result.amount}<br>` +
            `Acceso: ${plan.hours} horas<br><br>` +
            `⏳ Esperando confirmación de pago...`;
        
        // Iniciar polling para verificar estado
        await pollPaymentStatus(transactionId, 60000); // 60 segundos máximo
        
    } catch (error) {
        console.error('Error al procesar pago:', error);
        showError('Error de red. Por favor intente nuevamente.');
    }
}

// ============================================================
// 5. VERIFICAR ESTADO DEL PAGO (POLLING)
// ============================================================

async function pollPaymentStatus(transactionId, maxWaitTime) {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 segundos
    
    const checkStatus = async () => {
        try {
            const response = await fetch(`/api/v1/payments/status/${transactionId}`);
            const result = await response.json();
            
            if (!result.success) {
                return null;
            }
            
            const transaction = result.data;
            
            console.log(`Estado del pago: ${transaction.status}`);
            
            if (transaction.status === 'completed') {
                // Pago confirmado
                onPaymentSuccess(transaction);
                return;
            } else if (transaction.status === 'failed') {
                // Pago fallido
                showError(`Pago rechazado: ${transaction.errorMessage}`);
                return;
            }
            
            // Seguir esperando
            if (Date.now() - startTime < maxWaitTime) {
                setTimeout(checkStatus, pollInterval);
            } else {
                // Timeout
                showWarning('Tiempo de espera agotado. Intente nuevamente.');
            }
        } catch (error) {
            console.error('Error verificando estado:', error);
            if (Date.now() - startTime < maxWaitTime) {
                setTimeout(checkStatus, pollInterval);
            }
        }
    };
    
    checkStatus();
}

// ============================================================
// 6. MANEJAR PAGO EXITOSO
// ============================================================

function onPaymentSuccess(transaction) {
    const plan = transaction.plan || {};
    
    document.getElementById('oper-hint').innerHTML = 
        `✅ ¡PAGO COMPLETADO EXITOSAMENTE!<br><br>` +
        `Acceso WiFi: ${plan.hours} horas<br>` +
        `Monto pagado: Bs ${transaction.amount}<br>` +
        `Transacción: ${transaction.transactionId}<br><br>` +
        `Redirigiendo...`;
    
    document.getElementById('oper-hint').style.color = '#28a745';
    
    // Esperar 3 segundos y redirigir al landing
    setTimeout(() => {
        const landingUrl = getQueryStringKey('originUrl') || 'http://www.google.com';
        window.location.href = landingUrl;
    }, 3000);
}

// ============================================================
// 7. MOSTRAR ERRORES
// ============================================================

function showError(message) {
    const hint = document.getElementById('oper-hint');
    if (hint) {
        hint.innerHTML = `❌ ${message}`;
        hint.style.display = 'block';
        hint.style.color = '#dc3545';
    }
}

function showWarning(message) {
    const hint = document.getElementById('oper-hint');
    if (hint) {
        hint.innerHTML = `⚠️ ${message}`;
        hint.style.display = 'block';
        hint.style.color = '#ffc107';
    }
}

// ============================================================
// 8. INICIALIZAR AL CARGAR LA PÁGINA
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Portal iniciando...');
    
    // Cargar planes
    await loadAvailablePlans();
    
    // Configurar evento del selector de planes
    const planSelect = document.getElementById('plan-select');
    if (planSelect) {
        planSelect.addEventListener('change', () => {
            const selected = planSelect.options[planSelect.selectedIndex];
            if (selected.value) {
                const price = selected.dataset.price;
                const planAmountInput = document.getElementById('plan-amount');
                if (planAmountInput) {
                    planAmountInput.value = `Bs ${parseFloat(price).toFixed(2)}`;
                }
                showPaymentForm();
            }
        });
    }
    
    // Configurar botón de pago
    const payButton = document.getElementById('pay-button');
    if (payButton) {
        payButton.addEventListener('click', processMobilePayment);
    }
    
    // Permitir pago con Enter en el campo de teléfono
    const phoneInput = document.getElementById('phone-number');
    if (phoneInput) {
        phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processMobilePayment();
            }
        });
    }
});

// ============================================================
// 9. VERIFICAR SESIÓN ACTIVA AL CARGAR
// ============================================================

async function checkExistingSession() {
    const clientMac = getQueryStringKey('clientMac');
    if (!clientMac) return;
    
    try {
        const response = await fetch(`/api/v1/sessions/check/${clientMac}`);
        const result = await response.json();
        
        if (result.active && result.session) {
            // Usuario ya tiene sesión activa
            const timeRemaining = result.session.hoursRemaining;
            
            document.getElementById('oper-hint').innerHTML = 
                `✅ Ya tiene acceso WiFi activo<br>` +
                `Horas restantes: ${timeRemaining}<br>` +
                `Vencimiento: ${new Date(result.session.endTime).toLocaleString()}`;
            
            document.getElementById('plans-container').style.display = 'none';
            document.getElementById('payment-form').style.display = 'none';
        }
    } catch (error) {
        console.log('No hay sesión previa (esto es normal)');
    }
}

// Ejecutar al cargar
checkExistingSession();