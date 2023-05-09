import { Button, DropdownMenu } from '@pangolindex/core';
import './App.css';

function App() {
  return (
    <>
      <Button type="button" variant="primary" loading={true}>
        Test
      </Button>

      <DropdownMenu
        options={[
          {
            label: 'open',
            value: 'open',
          },
          {
            label: 'executed',
            value: 'executed',
          },
          {
            label: 'cancelled',
            value: 'cancelled',
          },
        ]}
        defaultValue={''}
        isMulti={true}
        menuPlacement={'top'}
        onSelect={(value) => {}}
      />
    </>
  );
}

export default App;
