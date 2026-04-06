import React from 'react';

export function InputsBlock() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-primary">Поля ввода (Inputs)</h3>
        <p className="text-sm text-subtle">Элементы форм для чата, редактирования профиля и настроек.</p>
      </div>
      
      <div className="p-8 border border-border rounded-3xl bg-surface flex flex-col gap-10 shadow-sm">
        
        {/* Standard Text Input */}
        <div className="flex flex-col gap-4 max-w-md">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Text Input (Default)</h4>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary">Имя пользователя</label>
            <input 
              type="text" 
              placeholder="Введите имя..." 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-secondary placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
            />
            <span className="text-xs text-subtle">Подсказка к полю ввода</span>
          </div>
        </div>

        {/* Input with Error */}
        <div className="flex flex-col gap-4 max-w-md">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Text Input (Error)</h4>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-error-muted">Email адрес</label>
            <input 
              type="email" 
              defaultValue="invalid-email" 
              className="w-full bg-error/5 border border-error/50 rounded-xl px-4 py-3 text-secondary focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all shadow-inner"
            />
            <span className="text-xs text-error-muted">Неверный формат email</span>
          </div>
        </div>

        {/* Chat Textarea */}
        <div className="flex flex-col gap-4 max-w-2xl">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Chat Textarea</h4>
          <div className="relative flex items-end bg-surface-hover border border-border rounded-3xl overflow-hidden focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all shadow-inner p-2">
            <textarea 
              placeholder="Напишите сообщение..." 
              className="w-full bg-transparent text-secondary px-4 py-3 text-sm focus:outline-none placeholder:text-subtle resize-none min-h-[60px] max-h-[200px] custom-scrollbar"
              rows={2}
            />
            <button className="w-10 h-10 shrink-0 flex items-center justify-center bg-accent text-white rounded-2xl hover:bg-accent-hover transition-colors mb-1 mr-1 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </div>

        {/* Select / Dropdown */}
        <div className="flex flex-col gap-4 max-w-md">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Select</h4>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary">Роль пользователя</label>
            <div className="relative">
              <select className="w-full bg-background border border-border rounded-xl px-4 py-3 text-secondary appearance-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner cursor-pointer">
                <option>Администратор</option>
                <option>Редактор</option>
                <option>Пользователь</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-subtle">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle / Checkbox */}
        <div className="flex flex-col gap-4 max-w-md">
          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Toggle & Checkbox</h4>
          <div className="flex flex-col gap-4 p-4 bg-background border border-border/50 rounded-2xl">
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-surface-highlight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent border border-border/50"></div>
              </div>
              <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">Включить уведомления</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border border-border rounded bg-surface-highlight peer-checked:bg-accent peer-checked:border-accent transition-colors">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <svg className="w-3 h-3 text-white opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">Согласен с условиями</span>
            </label>

          </div>
        </div>

      </div>
    </div>
  );
}
