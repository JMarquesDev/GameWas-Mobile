const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export function NumericKeypad({ value, onChange, maxLength, label }: { value: string; onChange: (value: string) => void; maxLength: number; label: string }) {
  return <div className="numeric-keypad" role="group" aria-label={`Teclado numérico para ${label}`}>
    {digits.map(digit => <button type="button" className="secondary" key={digit} aria-label={`${label}: ${digit}`} onClick={() => { if (value.length < maxLength) onChange(value + digit); }}>{digit}</button>)}
    <button type="button" className="secondary keypad-action" onClick={() => onChange('')}>Limpar</button>
    <button type="button" className="secondary" aria-label={`${label}: zero`} onClick={() => { if (value.length < maxLength) onChange(value + '0'); }}>0</button>
    <button type="button" className="secondary keypad-action" onClick={() => onChange(value.slice(0, -1))}>Apagar</button>
  </div>;
}
