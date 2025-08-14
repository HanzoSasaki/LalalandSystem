 document.addEventListener('DOMContentLoaded', function() {
            // Seleciona todos os itens do menu
            const menuItems = document.querySelectorAll('.menu-item');
            const frame = document.getElementById('dashboard-frame');
            const titleElement = document.getElementById('dashboard-title');
            
            // Adiciona evento de clique a cada item do menu
            menuItems.forEach(item => {
                item.addEventListener('click', function() {
                    // Remove a classe 'active' de todos os itens
                    menuItems.forEach(i => i.classList.remove('active'));
                    
                    // Adiciona a classe 'active' ao item clicado
                    this.classList.add('active');
                    
                    // Obtém o caminho do dashboard a partir do atributo data-src
                    const src = this.getAttribute('data-src');
                    
                    // Atualiza o iframe com o novo dashboard
                    frame.src = src;
                    
                    // Atualiza o título do header
                    const itemName = this.querySelector('span').textContent;
                    titleElement.textContent = itemName;
                });
            });
            
            // Carrega o primeiro dashboard por padrão
            frame.src = menuItems[0].getAttribute('data-src');
        });