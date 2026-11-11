import { usePreferences } from '../game/preferences';

export function Preferences() {
  const preferences = usePreferences();
  return <div className="preferences-fields">
    <label>Joystick <select value={preferences.joystickMode} onChange={event => preferences.update({ joystickMode: event.target.value as 'dynamic' | 'fixed' })}><option value="dynamic">Onde tocar na tela</option><option value="fixed">Fixo no canto</option></select></label>
    <label>Velocidade de caminhada <select value={preferences.speed} onChange={event => preferences.update({ speed: Number(event.target.value) })}>
      <option value={140}>Calma</option><option value={180}>Normal</option><option value={230}>Rápida</option>
    </select></label>
    <label>Volume geral <input type="range" min="0" max="1" step="0.05" value={preferences.volume} onChange={event => preferences.update({ volume: Number(event.target.value) })}/><output>{Math.round(preferences.volume * 100)}%</output></label>
    <label>Volume da música <input type="range" min="0" max="1" step="0.05" value={preferences.musicVolume} onChange={event => preferences.update({ musicVolume: Number(event.target.value) })}/><output>{Math.round(preferences.musicVolume * 100)}%</output></label>
    <label><input type="checkbox" checked={preferences.muted} onChange={event => preferences.update({ muted: event.target.checked })}/> Desativar todo o áudio</label>
    <label><input type="checkbox" checked={preferences.reducedMotion} onChange={event => preferences.update({ reducedMotion: event.target.checked })}/> Reduzir transições, respiração e animação da capa</label>
    <label><input type="checkbox" checked={preferences.largeText} onChange={event => preferences.update({ largeText: event.target.checked })}/> Texto ampliado</label>
    <label>Qualidade visual <select value={preferences.quality} onChange={event => preferences.update({ quality: event.target.value as 'low' | 'high' })}><option value="high">Alta · sombras e detalhes</option><option value="low">Compatível · desempenho</option></select></label>
    <p className="note">Preferências salvas neste navegador. O tempo da história não é um cronômetro.</p>

  </div>;
}
