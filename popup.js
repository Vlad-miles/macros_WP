document.addEventListener('DOMContentLoaded', function() {
    try {
        // Функция для безопасного получения элементов
        const getElement = (id) => {
            const el = document.getElementById(id);
            if (!el) {
                console.warn(`Элемент с ID "${id}" не найден`);
                return null;
            }
            return el;
        };

        // Получаем все элементы
        const elements = {
            panelToggle: getElement('panel-toggle'),
            copyButton: getElement('copy-button'),
            copyBlueTable: getElement('copy-blue-table'),
            copyTableCellStyle: getElement('copy-table-cell-style'),
            statusMessage: getElement('status-message'),
            copyCellStyle: getElement('copy-cell-style'),
            copyCellStyle1: getElement('copy-cell-style1'),
            copyCellStyle2: getElement('copy-cell-style2'),
            copyCellStyle3: getElement('copy-cell-style3'),
            copyCellStyle4: getElement('copy-cell-style4'),
            copyWideBorder: getElement('copy-wide-border'),
            copyNarrowBorder: getElement('copy-narrow-border'),
            copyGrayBg: getElement('copy-gray-bg'),
            spoilerTitle: getElement('spoiler-title'),
            spoilerContent: getElement('spoiler-content')
        };

        // Функция показа статуса
        function showStatus(message, isSuccess) {
            if (!elements.statusMessage) return;
            elements.statusMessage.textContent = message;
            elements.statusMessage.style.color = isSuccess ? 'green' : 'red';
            setTimeout(() => {
                if (elements.statusMessage) {
                    elements.statusMessage.textContent = '';
                }
            }, 2000);
        }

        // Улучшенная функция копирования
        async function copyToClipboard(html, successMessage) {
            try {
                // Создаем plain-text версию для fallback
                const text = html.replace(/<[^>]*>/g, '');
                
                // Пробуем современный API с поддержкой HTML
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
                
                // Fallback для старых браузеров
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
                if (elements.statusMessage) {
                    elements.statusMessage.innerHTML = `
                        <div style="margin-top: 10px; padding: 10px; background: #f8f8f8; border: 1px solid #ddd;">
                            <p>Скопируйте этот код:</p>
                            <textarea style="width: 100%; height: 100px;">${html}</textarea>
                        </div>
                    `;
                }
            }
        }

        // Функция обновления состояния панели
        function updatePanelState(enabled) {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (!tabs || tabs.length === 0) {
                    showStatus('Не удалось получить активную вкладку', false);
                    return;
                }
                
                const tabId = tabs[0].id;
                if (enabled) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content.js']
                    }).then(() => {
                        showStatus('Панель добавлена на страницу!', true);
                    }).catch(err => {
                        console.error('Ошибка при добавлении панели:', err);
                        showStatus('Ошибка при добавлении панели', false);
                    });
                } else {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: function() {
                            const panel = document.getElementById('wp-spoiler-panel');
                            if (panel) panel.remove();
                        }
                    }).then(() => {
                        showStatus('Панель удалена со страницы!', true);
                    }).catch(err => {
                        console.error('Ошибка при удалении панели:', err);
                        showStatus('Ошибка при удалении панели', false);
                    });
                }
            });
        }

        // Инициализация переключателя панели
        if (elements.panelToggle) {
            // Проверяем состояние переключателя при загрузке
            chrome.storage.sync.get(['panelEnabled'], function(result) {
                const isEnabled = result.panelEnabled !== false; // по умолчанию включено
                elements.panelToggle.checked = isEnabled;
                updatePanelState(isEnabled);
            });

            // Обработчик изменения состояния переключателя
            elements.panelToggle.addEventListener('change', function() {
                const enabled = this.checked;
                chrome.storage.sync.set({ panelEnabled: enabled });
                updatePanelState(enabled);
            });
        }

        // Обработчики для кнопок копирования
        if (elements.copyButton && elements.spoilerTitle && elements.spoilerContent) {
            elements.copyButton.addEventListener('click', function() {
                const title = elements.spoilerTitle.value;
                const content = elements.spoilerContent.value;
                
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
</div>
                `.trim();

                copyToClipboard(spoilerHTML, 'Спойлер скопирован!');
            });
        }

        if (elements.copyBlueTable) {
            elements.copyBlueTable.addEventListener('click', function() {
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
</table>
                `.trim();

                copyToClipboard(blueTableHTML, 'Таблица "Внимание" скопирована!');
            });
        }

        if (elements.copyTableCellStyle) {
            elements.copyTableCellStyle.addEventListener('click', function() {
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
</table>
                `.trim();

                copyToClipboard(redTableHTML, 'Таблица "Важно" скопирована!');
            });
        }

        // Обработчики для кнопок стилей
        const styleButtons = {
            copyCellStyle: 'width: 100%; white-space: normal; border: 3px solid #ffd1d1; padding: 20px;',
            copyCellStyle1: 'width: 100%; border-collapse: collapse; border: 1px solid #ebe6ff; background-color: #b3e6ff; height: 100%;',
            copyCellStyle2: 'width: 100%; border-collapse: collapse; border: 1px solid #d04437; background-color: #ffd1d1; height: 100%;',
            copyCellStyle3: 'width: 100%; border-collapse: collapse; border: 1px solid #A0E25E; background-color: #eaf8db; height: 100%;',
            copyCellStyle4: 'width: 100%; border-collapse: collapse; border: 1px solid #A0E25E; background-color: #e8e8e8; height: 100%;',
            copyWideBorder: 'width: 100%; white-space: normal; border: 3px solid #000000; padding: 10px;',
            copyNarrowBorder: 'width: 100%; white-space: normal; border: 1px solid #000000; padding: 10px;',
            copyGrayBg: 'width: 100%; white-space: normal; border: 1px solid #000000; padding: 10px; background-color: #e8e8e8;'
        };

        Object.keys(styleButtons).forEach(buttonId => {
            const button = elements[buttonId];
            if (button) {
                button.addEventListener('click', () => {
                    copyToClipboard(styleButtons[buttonId], 'Стиль скопирован!');
                });
            }
        });

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "getSpoilerHtml") {
                const title = elements.spoilerTitle?.value || 'название';
                const content = elements.spoilerContent?.value || 'текст';
                
                const html = `
<div style="border-top: 2px solid coral; border-bottom: 2px solid coral; margin: 10px 0;">
<details>
    <summary style="cursor: pointer; font-weight: bold;">
        <img src="https://corp-portal.tula.scloud.ru/wp-content/uploads/2025/08/shot_250812_150806-1.png" width="18" height="20" style="vertical-align: middle;">
        <strong>${title}</strong>
    </summary>
    <div style="padding: 10px;">${content}</div>
</details>
</div>`.trim();

                sendResponse({html});
            }
            return true;
        });

    } catch (error) {
        console.error('Ошибка инициализации:', error);
        if (elements.statusMessage) {
            elements.statusMessage.textContent = 'Ошибка при загрузке расширения';
            elements.statusMessage.style.color = 'red';
        }
    }
});