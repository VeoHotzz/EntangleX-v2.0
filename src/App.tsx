import { useMemo, useState } from 'react';
import { Header, type TabId } from './components/Header';
import { BellStateLab } from './components/tabs/BellStateLab';
import { LearnVivaQuizTab } from './components/tabs/LearnVivaQuizTab';
import { MeasurementShotsTab } from './components/tabs/MeasurementShotsTab';
import { BELL_PRESETS, describeState, evaluateCircuit } from './quantum/math';
import type { BellPresetId, CircuitConfig } from './types/quantum';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('bell-lab');
  const [circuitConfig, setCircuitConfig] = useState<CircuitConfig>(
    BELL_PRESETS['phi+'].config
  );

  const stateInfo = useMemo(() => {
    const vec = evaluateCircuit(circuitConfig);
    return describeState(vec);
  }, [circuitConfig]);

  const handleSelectPreset = (id: BellPresetId) => {
    setCircuitConfig({ ...BELL_PRESETS[id].config });
  };

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        stateInfo={stateInfo}
      />

      <main>
        {activeTab === 'bell-lab' && (
          <BellStateLab
            config={circuitConfig}
            stateInfo={stateInfo}
            onUpdateConfig={setCircuitConfig}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {activeTab === 'measurement' && (
          <MeasurementShotsTab labStateInfo={stateInfo} />
        )}

        {activeTab === 'learn' && <LearnVivaQuizTab />}
      </main>
    </div>
  );
}
