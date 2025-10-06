import { createRoot } from 'react-dom/client';
import { HE4SPasswordPrompt } from '../components/HE4SPasswordPrompt';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<HE4SPasswordPrompt />);
