
type DateSelectorProps = {
  year: number;
  month: number;
  day: number;
  stopName?: string;
  extraQueryParam?: string;
}

export default function DateSelector({ year, month, day, stopName, extraQueryParam }: DateSelectorProps) {
  // 日付変更時の処理
  const goToDate = () => {
    const yearElement = document.getElementById('year') as HTMLSelectElement;
    const monthElement = document.getElementById('month') as HTMLSelectElement;
    const dayElement = document.getElementById('day') as HTMLSelectElement;

    if (!yearElement || !monthElement || !dayElement) return;

    const selectedYear = yearElement.value;
    const selectedMonth = monthElement.value.padStart(2, '0');
    const selectedDay = dayElement.value.padStart(2, '0');

    const date = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    let url = '';
    if (stopName) {
      url = `/view/kintetsu-bus/stop/${encodeURIComponent(stopName)}?date=${date}`;
    } else {
      url = `/view/kintetsu-bus/calendar/${date}`;
    }

    if (extraQueryParam) {
      url += `&${extraQueryParam}`;
    }

    window.location.href = url;
  };

  return (
    <div class="date-selector">
      <label for="year">年:</label>
      <select id="year">
        <option value="2025" selected={year === 2025}>2025</option>
        <option value="2026" selected={year === 2026}>2026</option>
      </select>

      <label for="month">月:</label>
      <select id="month">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
          <option value={String(m)} selected={m === month}>{m}</option>
        ))}
      </select>

      <label for="day">日:</label>
      <select id="day">
        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
          <option value={String(d)} selected={d === day}>{d}</option>
        ))}
      </select>

      <button onClick={goToDate}>表示</button>
    </div>
  );
}