// Проверяем состояние панели при загрузке
chrome.storage.sync.get(['panelEnabled'], function(result) {
    if (result.panelEnabled === false) {
        const panel = document.getElementById('wp-spoiler-panel');
        if (panel) panel.remove();
        return;
    }
    createExtensionPanel();
});

// Функция создания панели
function createExtensionPanel() {
    // Проверяем, не добавлена ли уже панель
    if (document.getElementById('wp-spoiler-panel')) return;

    // Создаем контейнер для панели
    const panel = document.createElement('div');
    panel.id = 'wp-spoiler-panel';
    panel.style.position = 'fixed';
    panel.style.right = '20px';
    panel.style.top = '20px';
    panel.style.zIndex = '9999';
    panel.style.backgroundColor = '#f5f5f5';
    panel.style.padding = '15px';
    panel.style.border = '1px solid #ddd';
    panel.style.borderRadius = '5px';
    panel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    panel.style.maxWidth = '300px';
    
    // Добавляем HTML с кнопками и полями ввода
    panel.innerHTML = `
        <div class="panel-container">
            <h3 style="margin-top: 0;">Панель расширения</h3>
            <details class="panel-details"><summary>Генератор спойлера</summary>
            <div class="input-group">
                <label for="panel-spoiler-title">Заголовок:</label>
                <input type="text" id="panel-spoiler-title" value="название">
            </div>
            <div class="input-group">
                <label for="panel-spoiler-content">Текст:</label>
                <textarea id="panel-spoiler-content">текст</textarea>
            </div>
            <button type="button" class="panel-btn" id="panel-spoiler-btn">Скопировать спойлер</button>
             </details>
             <h3>Информации для закрепа - Шаг 1</h3>
              <div class="input-group">
            <button type="button" class="panel-btn" id="panel-blue-table-btn">Таблица "Внимание"</button>
            <button type="button" class="panel-btn" id="panel-red-table-btn">Таблица "Важно"</button>
               <h3>Информации для закрепа - Шаг 2</h3>
                <table class="iksweb">
		<tr>
			<td colspan="4">Параметры цвета</td>
			<td>Параметр рамки</td>
		</tr>
		<tr>
			 <td><button type="button" id="copy-cell-style1">*</button></td>
      <td><button type="button" id="copy-cell-style2">*</button></td>
      <td><button type="button" id="copy-cell-style3">*</button></td>
      <td><button type="button" id="copy-cell-style4">*</button></td>
				<td><button type="button" id="copy-cell-style" class="panel-btn">Стиль ячейки для таблиц</button></td>
		</tr>
</table>
            </div>
            <details class="panel-details">
                <summary>Стили таблиц</summary>
                <button type="button" class="panel-btn" id="panel-wide-border">Широкая рамка</button>
                <button type="button" class="panel-btn" id="panel-narrow-border">Узкая рамка</button>
                <button type="button" class="panel-btn" id="panel-gray-bg">Серый фон</button>
            </details>
            
            <div id="panel-status" style="font-size: 12px; margin-top: 5px; color: green;"></div>
        </div>
    `;
    
    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        #wp-spoiler-panel .panel-btn {
            background: #2271b1;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 3px;
            cursor: pointer;
            margin: 5px 0;
            width: 100%;
            display: block;
        }
        #wp-spoiler-panel .panel-btn:hover {
            background: #135e96;
        }
        #wp-spoiler-panel .panel-details {
            background: #2271b1;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 3px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 5px;
        }
        #wp-spoiler-panel .panel-details:hover {
            background: #135e96;
        }
        #wp-spoiler-panel .panel-details summary {
            cursor: pointer;
            outline: none;
        }
        #wp-spoiler-panel .input-group {
            margin-bottom: 10px;
        }
        #wp-spoiler-panel label {
            display: block;
            margin-bottom: 3px;
            font-size: 13px;
            color: #ffffff;
            padding-top: 10px;
            padding-bottom: 10px;
        }
        #copy-cell-style1 {
            border: 2px solid #000000; 
            background-color: #b3e6ff;
        }
        #copy-cell-style1:hover {
            background-color: #7da3b6;
        }
        #copy-cell-style2 {
            background: #ffd1d1;
            border: 2px solid #000000;
        }
        #copy-cell-style2:hover {
            background-color: #bb8e8e;
        }
        #copy-cell-style3 {
            background: #eaf8db;
            border: 2px solid #000000;
        }
        #copy-cell-style3:hover {
            background-color: #a5b398;
        }
        #copy-cell-style4 {
            background: #e8e8e8;
            border: 2px solid #000000;
        }
        #copy-cell-style4:hover {
            background-color: #8d7d7d;
        }
        #wp-spoiler-panel textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
            box-sizing: border-box;
            min-height: 60px;
            resize: vertical;
        }
    `;
    panel.appendChild(style);
    
    // Функция для показа статуса
    function showStatus(message, isSuccess) {
        const statusEl = panel.querySelector('#panel-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.color = isSuccess ? 'green' : 'red';
            setTimeout(() => statusEl.textContent = '', 2000);
        }
    }

    // Улучшенная функция копирования
    async function copyToClipboard(html, successMessage) {
        try {
            const text = html.replace(/<[^>]*>/g, '');
            
            if (navigator.clipboard && window.ClipboardItem) {
                const htmlBlob = new Blob([html], { type: 'text/html' });
                const textBlob = new Blob([text], { type: 'text/plain' });
                const clipboardItem = new ClipboardItem({
                    'text/html': htmlBlob,
                    'text/plain': textBlob
                });
                
                await navigator.clipboard.write([clipboardItem]);
                showStatus(successMessage, true);
                return;
            }
            
            const range = document.createRange();
            const div = document.createElement('div');
            div.innerHTML = html;
            document.body.appendChild(div);
            range.selectNode(div);
            
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            const success = document.execCommand('copy');
            selection.removeAllRanges();
            document.body.removeChild(div);
            
            showStatus(success ? successMessage + ' (использован fallback)' : 'Ошибка копирования!', success);
        } catch (err) {
            console.error('Ошибка копирования:', err);
            showStatus('Ошибка! Скопируйте вручную', false);
            if (panel.querySelector('#panel-status')) {
                panel.querySelector('#panel-status').innerHTML = `
                    <div style="margin-top: 10px; padding: 10px; background: #f8f8f8; border: 1px solid #ddd;">
                        <p>Скопируйте этот код:</p>
                        <textarea style="width: 100%; height: 100px;">${html}</textarea>
                    </div>
                `;
            }
        }
    }

    // Обработчики кнопок
    panel.querySelector('#panel-spoiler-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const title = panel.querySelector('#panel-spoiler-title').value || 'название';
            const content = panel.querySelector('#panel-spoiler-content').value || 'текст';
            
            const spoilerHTML = `
<div style="border-top: 2px solid coral; border-bottom: 2px solid coral; margin: 10px 0;">
<hr>
<details>
    <summary style="cursor: pointer; font-weight: bold;">
        <img src="https://corp-portal.tula.scloud.ru/wp-content/uploads/2025/08/shot_250812_150806-1.png" width="18" height="20" style="vertical-align: middle;">
        <strong>${title}</strong>
    </summary>
    <div style="padding: 10px;">${content}</div>
</details>
<hr>
</div>`.trim();
            
            await copyToClipboard(spoilerHTML, 'Спойлер скопирован!');
        } catch (err) {
            console.error('Ошибка копирования:', err);
            showStatus('Ошибка копирования!', false);
        }
    });

    panel.querySelector('#panel-blue-table-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        const blueTableHTML = `
<table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#b3e6ff">
    <tr>
        <td width="100%" style="padding:3px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="20" bgcolor="#ffffff">
                <tr>
                    <td width="100%">
                        <strong>⚠ Внимание!</strong><br><br>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`.trim();
        await copyToClipboard(blueTableHTML, 'Таблица "Внимание" скопирована!');
    });

    panel.querySelector('#panel-red-table-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        const redTableHTML = `
<table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffb3b3">
    <tr>
        <td width="100%" style="padding:3px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="20" bgcolor="#ffffff">
                <tr>
                    <td width="100%">
                        <strong>⚠ ВАЖНО!</strong><br><br>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`.trim();
        await copyToClipboard(redTableHTML, 'Таблица "Важно" скопирована!');
    });

    // Обработчики для кнопок стилей
    const styleButtons = {
        'copy-cell-style': 'width: 100%; white-space: normal; border: 3px solid #ffd1d1; padding: 20px;',
        'copy-cell-style1': 'width: 100%; border-collapse: collapse; border: 1px solid #ebe6ff; background-color: #b3e6ff; height: 100%;',
        'copy-cell-style2': 'width: 100%; border-collapse: collapse; border: 1px solid #d04437; background-color: #ffd1d1; height: 100%;',
        'copy-cell-style3': 'width: 100%; border-collapse: collapse; border: 1px solid #A0E25E; background-color: #eaf8db; height: 100%;',
        'copy-cell-style4': 'width: 100%; border-collapse: collapse; border: 1px solid #A0E25E; background-color: #e8e8e8; height: 100%;',
        'panel-wide-border': 'width: 100%; white-space: normal; border: 3px solid #000000; padding: 10px;',
        'panel-narrow-border': 'width: 100%; white-space: normal; border: 1px solid #000000; padding: 10px;',
        'panel-gray-bg': 'width: 100%; white-space: normal; border: 1px solid #000000; padding: 10px; background-color: #e8e8e8;'
    };

    Object.keys(styleButtons).forEach(buttonId => {
        const button = panel.querySelector(`#${buttonId}`);
        if (button) {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await copyToClipboard(styleButtons[buttonId], 'Стиль скопирован!');
            });
        }
    });

    // Вставляем панель в документ
    document.body.appendChild(panel);

    // Пытаемся найти элемент с классом postbox и вставить туда
    const postbox = document.querySelector('.postbox');
    if (postbox) {
        postbox.appendChild(panel);
        panel.style.position = 'static';
        panel.style.boxShadow = 'none';
    }
}

// Наблюдатель за изменениями DOM (объявляем только один раз)
if (!window.wpSpoilerObserver) {
    window.wpSpoilerObserver = new MutationObserver(() => {
        chrome.storage.sync.get(['panelEnabled'], function(result) {
            if (result.panelEnabled === false) {
                const panel = document.getElementById('wp-spoiler-panel');
                if (panel) panel.remove();
                return;
            }
            if (!document.getElementById('wp-spoiler-panel')) {
                createExtensionPanel();
            }
        });
    });

    window.wpSpoilerObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}