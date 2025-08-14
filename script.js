  document.addEventListener('DOMContentLoaded', function() {
            const dashboardMenu = document.getElementById('dashboard-menu');
            const contentFrame = document.getElementById('content-frame');
            const loadingOverlay = document.getElementById('loading-overlay');
            const mainContent = document.getElementById('main-content');
            
            // Simulação de carregamento do dashboard
            function loadDashboard() {
                // Mostrar animação de carregamento
                loadingOverlay.style.display = 'flex';
                contentFrame.style.display = 'none';
                
                // Simular tempo de carregamento
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    contentFrame.style.display = 'block';
                    
                    // Ativar o menu selecionado
                    document.querySelectorAll('.menu-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    dashboardMenu.classList.add('active');
                }, 1500);
            }
            
            // Carregar o dashboard inicialmente
            loadDashboard();
            
            // Evento de clique no menu Dashboard
            dashboardMenu.addEventListener('click', loadDashboard);
            
            // Eventos para outros itens de menu
            document.querySelectorAll('.menu-item').forEach(item => {
                if(item !== dashboardMenu) {
                    item.addEventListener('click', function() {
                        document.querySelectorAll('.menu-item').forEach(i => {
                            i.classList.remove('active');
                        });
                        this.classList.add('active');
                        
                        // Mostrar mensagem para outros menus
                        loadingOverlay.style.display = 'flex';
                        contentFrame.style.display = 'none';
                        
                        setTimeout(() => {
                            loadingOverlay.style.display = 'none';
                            mainContent.innerHTML = `
                                <div style="background: white; border-radius: 10px; padding: 30px; height: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                                    <h1 style="color: var(--cinza-escuro); margin-bottom: 20px;">${this.querySelector('span').textContent}</h1>
                                    <p style="color: var(--cinza-medio); line-height: 1.6;">
                                        Esta é a seção de ${this.querySelector('span').textContent}. O conteúdo específico seria carregado aqui.
                                    </p>
                                    <div style="margin-top: 30px; background: var(--cinza-claro); border-radius: 8px; padding: 20px; text-align: center;">
                                        <i class="fas fa-${this.querySelector('i').className.split(' ')[1]}" style="font-size: 48px; color: var(--rosa); margin-bottom: 15px;"></i>
                                        <p>Área de ${this.querySelector('span').textContent}</p>
                                    </div>
                                </div>
                            `;
                        }, 1000);
                    });
                }
            });
        });