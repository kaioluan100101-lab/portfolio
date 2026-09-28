

document.addEventListener('DOMContentLoaded', function () {
  initThemeToggle();
  initMobileMenu();
  initScrollReveal();
  //initTypingEffect();
  initSkillBars();
  initProjectFilter();
  initContactForm();
});

/* ---------------------------------------------------------
   1) Alternância de tema claro/escuro
   Usa o atributo data-theme na tag <html> e respeita a
   preferência do sistema operacional como valor inicial.
--------------------------------------------------------- */
function initThemeToggle() {
  var root = document.documentElement;
  var toggleBtn = document.querySelector('.theme-toggle');

  var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', function () {
    var current = root.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    toggleBtn.setAttribute('aria-pressed', next === 'light');
  });
}

/* ---------------------------------------------------------
   2) Menu de navegação responsivo (hambúrguer)
--------------------------------------------------------- */
function initMobileMenu() {
  var menuBtn = document.querySelector('.menu-btn');
  var navTabs = document.querySelector('.nav-tabs');
  if (!menuBtn || !navTabs) return;

  menuBtn.addEventListener('click', function () {
    var isOpen = navTabs.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  // Fecha o menu ao clicar em um link (melhora a navegação em mobile)
  navTabs.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navTabs.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------
   3) Efeito interativo: revelação de seções ao rolar a página
   Usa IntersectionObserver para performance (evita listeners
   de scroll manuais).
--------------------------------------------------------- */
function initScrollReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(function (el) { observer.observe(el); });
}

/* ---------------------------------------------------------
   4) Efeito interativo: animação de "digitação" no editor
   de código exibido na hero da página inicial.
--------------------------------------------------------- */
function initTypingEffect() {
  const code = document.querySelector(".editor-code");

  if (!code) return;

  code.insertAdjacentHTML(
    "beforeend",
    '<span class="cursor"></span>'
  );
}
/* ---------------------------------------------------------
   5) Barras de habilidades animadas (página Sobre)
--------------------------------------------------------- */
function initSkillBars() {
  var bars = document.querySelectorAll('.skill-fill');
  if (!bars.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var target = entry.target.getAttribute('data-level');
        entry.target.style.width = target + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(function (bar) { observer.observe(bar); });
}

/* ---------------------------------------------------------
   6) Efeito interativo: filtro de projetos por categoria
   (página Projetos)
--------------------------------------------------------- */
function initProjectFilter() {
  var buttons = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.project-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');

      var filter = btn.getAttribute('data-filter');

      cards.forEach(function (card) {
        var category = card.getAttribute('data-category');
        var shouldShow = filter === 'todos' || filter === category;
        card.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });
}

/* ---------------------------------------------------------
   7) Validação do formulário de contato
   Valida nome, e-mail, assunto e mensagem antes de simular
   o envio. Sem dependências externas.
--------------------------------------------------------- */
function initContactForm() {
  var form = document.querySelector('#contact-form');
  if (!form) return;

  var statusBox = form.querySelector('.form-status');

  var validators = {
    name: function (value) {
      return value.trim().length >= 3 ? '' : 'Informe seu nome completo (mínimo 3 caracteres).';
    },
    email: function (value) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(value.trim()) ? '' : 'Informe um e-mail válido.';
    },
    subject: function (value) {
      return value.trim().length >= 4 ? '' : 'Informe um assunto com pelo menos 4 caracteres.';
    },
    message: function (value) {
      return value.trim().length >= 10 ? '' : 'Sua mensagem deve ter pelo menos 10 caracteres.';
    }
  };

  function validateField(field) {
    var name = field.name;
    var validator = validators[name];
    if (!validator) return true;

    var row = field.closest('.form-row');
    var errorMsg = validator(field.value);

    if (errorMsg) {
      row.classList.add('has-error');
      row.querySelector('.error-msg').textContent = errorMsg;
      return false;
    } else {
      row.classList.remove('has-error');
      return true;
    }
  }

  // Validação em tempo real (ao sair do campo)
  Object.keys(validators).forEach(function (name) {
    var field = form.querySelector('[name="' + name + '"]');
    if (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var row = field.closest('.form-row');
        if (row.classList.contains('has-error')) validateField(field);
      });
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var isValid = true;
    Object.keys(validators).forEach(function (name) {
      var field = form.querySelector('[name="' + name + '"]');
      if (field && !validateField(field)) isValid = false;
    });

    statusBox.classList.remove('show', 'success', 'error-status');

    if (!isValid) {
      statusBox.textContent = '⚠ Corrija os campos destacados antes de enviar.';
      statusBox.classList.add('show', 'error-status');
      var firstError = form.querySelector('.has-error input, .has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    // Simulação de envio (não há backend neste projeto acadêmico).
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    setTimeout(function () {
      statusBox.textContent = '✓ Mensagem enviada com sucesso! Retornarei em breve.';
      statusBox.classList.add('show', 'success');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
    }, 900);
  });
}