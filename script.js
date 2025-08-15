 document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const menuItems = document.querySelectorAll('.menu-item');
    const navItems = document.querySelectorAll('.nav-item');
    const dashboardFrame = document.getElementById('dashboard-frame');
    const dashboardTitle = document.getElementById('dashboard-title');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    const iframeLoader = document.getElementById('iframe-loader');
    const menuToggleIcon = menuToggle.querySelector('i');

    // Função para carregar o dashboard
    function loadDashboard(src, title) {
        // Mostrar loader
        iframeLoader.style.display = 'block';
        
        // Carregar o iframe
        dashboardFrame.src = src;
        dashboardTitle.textContent = title;

        // Atualizar estado ativo
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.src === src) {
                item.classList.add('active');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.target === src) {
                item.classList.add('active');
            }
        });

        // Fechar menu lateral em mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggleIcon.classList.remove('fa-times');
            menuToggleIcon.classList.add('fa-bars');
        }
    }

    // Função para esconder o loader
    window.hideLoader = function() {
        iframeLoader.style.display = 'none';
    };

    // Eventos para itens do menu lateral
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            loadDashboard(this.dataset.src, this.querySelector('span').textContent);
        });
        
        // Suporte para teclado
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                loadDashboard(this.dataset.src, this.querySelector('span').textContent);
            }
        });
    });

    // Eventos para itens da barra mobile
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            loadDashboard(this.dataset.target, this.querySelector('span').textContent);
        });
        
        // Suporte para teclado
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                loadDashboard(this.dataset.target, this.querySelector('span').textContent);
            }
        });
    });

    // Evento para o botão de menu mobile
    menuToggle.addEventListener('click', function(e) {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!isExpanded));
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Alterar ícone
        if (sidebar.classList.contains('active')) {
            menuToggleIcon.classList.remove('fa-bars');
            menuToggleIcon.classList.add('fa-times');
        } else {
            menuToggleIcon.classList.remove('fa-times');
            menuToggleIcon.classList.add('fa-bars');
        }
        
        e.stopPropagation();
    });

    // Fechar menu ao clicar no overlay
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggleIcon.classList.remove('fa-times');
        menuToggleIcon.classList.add('fa-bars');
    });

    // Fechar menu ao clicar fora em telas menores
    document.addEventListener('click', function(e) {
        if (window.innerWidth > 768) return;

        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggleIcon.classList.remove('fa-times');
            menuToggleIcon.classList.add('fa-bars');
        }
    });

    // Efeito ripple nos botões - versão melhorada
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const rect = button.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add("ripple");

        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) ripple.remove();

        button.appendChild(circle);
        
        // Remover elemento após a animação
        setTimeout(() => {
            if (circle.parentNode === button) {
                button.removeChild(circle);
            }
        }, 600);
    }
    const rippleButtons = document.querySelectorAll('.menu-item, .nav-item, .menu-toggle');
    
    // Lidar com redimensionamento da janela
    window.addEventListener('resize', function() {
        // Fechar menu se redimensionar para desktop
        if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggleIcon.classList.remove('fa-times');
            menuToggleIcon.classList.add('fa-bars');
        }
    });
    
    // Garantir que o iframe tenha foco ao carregar
    dashboardFrame.addEventListener('load', function() {
        this.contentWindow.focus();
    });
});