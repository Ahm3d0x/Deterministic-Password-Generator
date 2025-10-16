
    // تحديث السنة تلقائياً
    document.getElementById("year").textContent = new Date().getFullYear();
    document.getElementById("year-footer").textContent = new Date().getFullYear();

    // ==================== STATE ====================
    let darkTheme = true;
    let currentPassword = "";
    let currentInputData = {};

    // ==================== ELEMENTS ====================
    const resultModal = document.getElementById('result-modal');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsOverlay = document.getElementById('settings-overlay');
    const alertModal = document.getElementById('alert-modal');

    // ==================== CUSTOM ALERT ====================
    function showAlert(title, message, icon = '⚠️') {
      document.getElementById('alert-title').textContent = title;
      document.getElementById('alert-message').textContent = message;
      document.getElementById('alert-icon').textContent = icon;
      alertModal.classList.remove('hidden');
      
      // Add shake animation
      const modalContent = alertModal.querySelector('.glass');
      modalContent.classList.add('animate-shake');
      setTimeout(() => {
        modalContent.classList.remove('animate-shake');
      }, 500);
    }

    document.getElementById('alert-close').onclick = () => {
      alertModal.classList.add('hidden');
    };

    alertModal.onclick = (e) => {
      if(e.target === alertModal) alertModal.classList.add('hidden');
    };

    // ==================== TOGGLE SECRET VISIBILITY ====================
    let mainSecretVisible = false;
    document.getElementById('toggle-main-secret').onclick = function() {
      mainSecretVisible = !mainSecretVisible;
      const input = document.getElementById('secret-key');
      input.type = mainSecretVisible ? 'text' : 'password';
      this.textContent = mainSecretVisible ? '👁️‍🗨️' : '👁️';
    };

    // ==================== ADVANCED PASSWORD GENERATION ====================
    async function generateSecurePassword(serviceName, username, account, secretKey, minLength = 16) {
      // Step 1: Create multiple hashes with different salts
      const salt1 = "QuantumSalt2024!@#$%^&*()";
const salt2 = "SecureHash9876MixAlgo";
      const salt3 = serviceName + username + account;
      
      // Combine all inputs with salts
      const combined1 = `${salt1}${serviceName}${username}${account}${secretKey}${salt2}`;
      const combined2 = `${secretKey}${salt3}${serviceName}${username}${salt1}`;
      const combined3 = `${account}${username}${secretKey}${serviceName}${salt2}`;
      
      // Generate SHA-256 hashes
      const hash1 = await sha256(combined1);
      const hash2 = await sha256(combined2);
      const hash3 = await sha256(combined3);
      
      // Apply PBKDF2 (simulated with multiple iterations)
      let derivedKey = hash1;
      for(let i = 0; i < 1000; i++) {
        derivedKey = await sha256(derivedKey + hash2 + i + hash3);
      }
      
      // Character sets
      const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
      const lowercase = "abcdefghjkmnpqrstuvwxyz";
      const numbers = "23456789";
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const allChars = uppercase + lowercase + numbers + symbols;
      
      // Convert hash to bytes
      const bytes = [];
      for(let i = 0; i < derivedKey.length; i += 2) {
        bytes.push(parseInt(derivedKey.substr(i, 2), 16));
      }
      
      // Build password - MUST START WITH A LETTER
      let password = "";
      
      // First character MUST be a letter (uppercase or lowercase)
      const firstCharSet = uppercase + lowercase;
      password += firstCharSet[bytes[0] % firstCharSet.length];
      
      // Ensure at least 2 of each type after first character
      password += uppercase[bytes[1] % uppercase.length];
      password += lowercase[bytes[2] % lowercase.length];
      password += lowercase[bytes[3] % lowercase.length];
      password += numbers[bytes[4] % numbers.length];
      password += numbers[bytes[5] % numbers.length];
      password += symbols[bytes[6] % symbols.length];
      password += symbols[bytes[7] % symbols.length];
      
      // Fill the rest with mixed characters
      for(let i = 8; i < minLength; i++) {
        const byteIndex = i % bytes.length;
        const charIndex = bytes[byteIndex] % allChars.length;
        password += allChars[charIndex];
      }
      
      // Shuffle password BUT keep first character as letter
      const firstChar = password[0];
      const restOfPassword = password.substring(1);
      const shuffledRest = shuffleString(restOfPassword, bytes);
      password = firstChar + shuffledRest;
      
      // Extra security: Add position-based transformations (skip first char)
      let finalPassword = password[0]; // Keep first character
      for(let i = 1; i < password.length; i++) {
        const byte = bytes[i % bytes.length];
        const char = password[i];
        if(byte % 3 === 0 && /[a-z]/.test(char)) {
          finalPassword += char.toUpperCase();
        } else if(byte % 5 === 0 && /[A-Z]/.test(char)) {
          finalPassword += char.toLowerCase();
        } else {
          finalPassword += char;
        }
      }
      
      // Final check: Ensure first character is still a letter
      if(!/[A-Za-z]/.test(finalPassword[0])) {
        const letterSet = uppercase + lowercase;
        finalPassword = letterSet[bytes[0] % letterSet.length] + finalPassword.substring(1);
      }
      
      return finalPassword;
    }

    // SHA-256 Helper
    async function sha256(str) {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Shuffle String Helper
    function shuffleString(str, bytes) {
      let arr = str.split('');
      for(let i = arr.length - 1; i > 0; i--) {
        const j = bytes[i % bytes.length] % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join('');
    }

    // ==================== GENERATE PASSWORD BUTTON ====================
    document.getElementById('generate-btn').onclick = async function() {
      const serviceName = document.getElementById('service-name').value.trim();
      const username = document.getElementById('username').value.trim();
      const account = document.getElementById('account').value.trim();
      const secretKey = document.getElementById('secret-key').value;
      
      // Validation
      if(!serviceName) {
        showAlert('خطأ في الإدخال', 'الرجاء إدخال اسم الخدمة أو البرنامج!', '❌');
        return;
      }
      
      if(!username) {
        showAlert('خطأ في الإدخال', 'الرجاء إدخال اسم المستخدم أو البريد الإلكتروني!', '❌');
        return;
      }
      
      if(secretKey.length < 8) {
        showAlert('خطأ في الإدخال', 'المفتاح السري يجب أن يكون 8 أحرف على الأقل!', '❌');
        return;
      }
      
      // Save input data
      currentInputData = {
        serviceName,
        username,
        account,
        secretKey
      };
      
      // Show loading
      this.innerHTML = '<span class="animate-spin text-2xl">⏳</span><span>جاري التوليد...</span>';
      this.disabled = true;
      
      setTimeout(async () => {
        try {
          // Generate password
          const password = await generateSecurePassword(
            serviceName,
            username,
            account,
            secretKey,
            16
          );
          
          currentPassword = password;
          
          // Show result
          showPasswordResult(password);
          
          // Reset button
          this.innerHTML = '<span class="text-2xl">🚀</span><span class="text-lg">توليد الباسورد الآن</span>';
          this.disabled = false;
        } catch(error) {
          showAlert('خطأ', 'حدث خطأ أثناء توليد الباسورد!', '❌');
          this.innerHTML = '<span class="text-2xl">🚀</span><span class="text-lg">توليد الباسورد الآن</span>';
          this.disabled = false;
        }
      }, 1000);
    };

    // ==================== RESET BUTTON ====================
    document.getElementById('reset-btn').onclick = function() {
      document.getElementById('service-name').value = '';
      document.getElementById('username').value = '';
      document.getElementById('account').value = '';
      document.getElementById('secret-key').value = '';
      currentPassword = "";
      currentInputData = {};
      
      showAlert('تم إعادة التعيين', 'تم مسح جميع الحقول بنجاح!', '✅');
    };

    // ==================== SHOW PASSWORD RESULT ====================
    function showPasswordResult(password) {
      // Display password (hidden initially)
      document.getElementById('result-password').textContent = "•".repeat(password.length);
      document.getElementById('result-password').setAttribute('data-password', password);
      
      // Calculate statistics
      const uppercase = (password.match(/[A-Z]/g) || []).length;
      const lowercase = (password.match(/[a-z]/g) || []).length;
      const numbers = (password.match(/[0-9]/g) || []).length;
      const symbols = (password.match(/[^A-Za-z0-9]/g) || []).length;
      
      document.getElementById('pwd-length').textContent = password.length;
      document.getElementById('pwd-numbers').textContent = numbers;
      document.getElementById('pwd-letters').textContent = uppercase + lowercase;
      document.getElementById('pwd-symbols').textContent = symbols;
      
      // Show strength
      showStrength(password);
      
      // Show modal
      resultModal.classList.remove('hidden');
    }

    // ==================== CLOSE RESULT MODAL ====================
    document.getElementById('close-result').onclick = () => {
      resultModal.classList.add('hidden');
    };

    resultModal.onclick = (e) => {
      if(e.target === resultModal) resultModal.classList.add('hidden');
    };

    // ==================== TOGGLE RESULT VISIBILITY ====================
    let resultVisible = false;
    document.getElementById('toggle-result').onclick = function() {
      const span = document.getElementById('result-password');
      const pw = span.getAttribute('data-password');
      resultVisible = !resultVisible;
      span.textContent = resultVisible ? pw : "•".repeat(pw.length);
      this.innerHTML = resultVisible ? '<span class="text-2xl">👁️‍🗨️</span>' : '<span class="text-2xl">👁️</span>';
    };

    // ==================== COPY RESULT ====================
    document.getElementById('copy-result').onclick = function() {
      const pw = document.getElementById('result-password').getAttribute('data-password');
      navigator.clipboard.writeText(pw);
      const msg = document.getElementById('copy-msg');
      const msgText = document.getElementById('copy-msg-text');
      msgText.textContent = 'تم نسخ الباسورد!';
      msg.classList.remove('hidden');
      this.innerHTML = '<span class="text-2xl text-green-400">✔</span>';
      setTimeout(() => {
        msg.classList.add('hidden');
        this.innerHTML = '<span class="text-2xl">📋</span>';
      }, 2500);
    };

    // ==================== COPY ALL DATA ====================
    document.getElementById('copy-all-data').onclick = function() {
      const pw = document.getElementById('result-password').getAttribute('data-password');
      const data = `
╔════════════════════════════════════════╗
║     معلومات الباسورد المولد           ║
╚════════════════════════════════════════╝

🔐 الباسورد: ${pw}

📱 اسم الخدمة: ${currentInputData.serviceName}
👤 اسم المستخدم: ${currentInputData.username}
🔢 رقم الحساب: ${currentInputData.account || 'غير محدد'}
🔒 المفتاح السري: ${currentInputData.secretKey}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 إحصائيات الباسورد:
   • الطول: ${pw.length} حرف
   • الأرقام: ${(pw.match(/[0-9]/g) || []).length}
   • الأحرف: ${(pw.match(/[A-Za-z]/g) || []).length}
   • الرموز: ${(pw.match(/[^A-Za-z0-9]/g) || []).length}

⚡ ملاحظة: نفس المدخلات = نفس الباسورد دائماً
🔒 تم التوليد باستخدام: SHA-256 + PBKDF2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ مولد الباسورد الذكي | Smart Password Generator
      `.trim();
      
      navigator.clipboard.writeText(data);
      const msg = document.getElementById('copy-msg');
      const msgText = document.getElementById('copy-msg-text');
      msgText.textContent = 'تم نسخ كل البيانات!';
      msg.classList.remove('hidden');
      this.innerHTML = '<span class="text-2xl text-green-400">✔</span>';
      setTimeout(() => {
        msg.classList.add('hidden');
        this.innerHTML = '<span class="text-2xl">📄</span>';
      }, 2500);
    };

    // ==================== STRENGTH INDICATOR ====================
    function showStrength(password) {
      let score = 0;
      
      // Length scoring
      if(password.length >= 10) score += 20;
      if(password.length >= 12) score += 15;
      if(password.length >= 14) score += 15;
      
      // Character variety
      if(/[A-Z]/.test(password)) score += 15;
      if(/[a-z]/.test(password)) score += 15;
      if(/[0-9]/.test(password)) score += 10;
      if(/[^A-Za-z0-9]/.test(password)) score += 10;
      
      // Multiple of each type
      if((password.match(/[A-Z]/g) || []).length >= 2) score += 5;
      if((password.match(/[a-z]/g) || []).length >= 2) score += 5;
      if((password.match(/[0-9]/g) || []).length >= 2) score += 5;
      if((password.match(/[^A-Za-z0-9]/g) || []).length >= 2) score += 5;
      
      // Cap at 100
      score = Math.min(100, score);
      
      let color = score < 60 ? '#ef4444' : score < 85 ? '#f97316' : '#22c55e';
      let bgColor = score < 60 ? '#7f1d1d' : score < 85 ? '#7c2d12' : '#14532d';
      let strengthText = score < 60 ? '⚠️ متوسط' : score < 85 ? '⚡ قوي' : '🛡️ قوي جداً';
      
      document.getElementById('strength-indicator').innerHTML = `
        <div class="glass-dark rounded-xl p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-400">قوة الباسورد:</span>
            <span class="text-sm font-bold" style="color:${color}">${strengthText}</span>
          </div>
          <div class="w-full h-4 rounded-full overflow-hidden" style="background:${bgColor}">
            <div style="width:${score}%;background:${color};" class="h-4 transition-500 animate-shimmer"></div>
          </div>
          <div class="text-right mt-2">
            <span class="text-xs font-mono" style="color:${color}">${score}%</span>
          </div>
        </div>
      `;
    }

    // ==================== SETTINGS PANEL ====================
    document.getElementById('settings-btn').onclick = () => {
      settingsPanel.classList.remove('hidden');
      settingsOverlay.classList.remove('hidden');
    };

    document.getElementById('close-settings').onclick = () => {
      settingsPanel.classList.add('hidden');
      settingsOverlay.classList.add('hidden');
    };

    settingsOverlay.onclick = () => {
      settingsPanel.classList.add('hidden');
      settingsOverlay.classList.add('hidden');
    };

    // ==================== THEME TOGGLE ====================
    function toggleTheme() {
      darkTheme = !darkTheme;
      const body = document.getElementById('body');
      
      if(darkTheme) {
        body.className = "min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-blue-950 text-white transition-500 overflow-x-hidden";
        document.getElementById('theme-icon').textContent = '🌙';
        document.getElementById('theme-text').textContent = 'داكن';
      } else {
        body.className = "min-h-screen bg-gradient-to-br from-slate-400 via-gray-800 to-gray-600 text-gray-900 transition-500 overflow-x-hidden";
        document.getElementById('theme-icon').textContent = '☀️';
        document.getElementById('theme-text').textContent = 'فاتح';
      }
    }

    document.getElementById('theme-toggle').onclick = toggleTheme;
    document.getElementById('theme-btn').onclick = toggleTheme;

    // ==================== KEYBOARD SHORTCUTS ====================
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: Focus service name
      if((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('service-name').focus();
      }
      
      // Escape: Close modals and panels
      if(e.key === 'Escape') {
        resultModal.classList.add('hidden');
        settingsPanel.classList.add('hidden');
        settingsOverlay.classList.add('hidden');
        alertModal.classList.add('hidden');
      }
      
      // Enter: Generate password
      if(e.key === 'Enter') {
        const activeEl = document.activeElement;
        if(activeEl.id === 'service-name' || activeEl.id === 'username' || 
           activeEl.id === 'account' || activeEl.id === 'secret-key') {
          document.getElementById('generate-btn').click();
        }
      }
    });

    // ==================== SECURITY: CLEAR ON PAGE UNLOAD ====================
    window.onbeforeunload = () => {
      currentPassword = "";
      currentInputData = {};
      document.getElementById('service-name').value = '';
      document.getElementById('username').value = '';
      document.getElementById('account').value = '';
      document.getElementById('secret-key').value = '';
    };
