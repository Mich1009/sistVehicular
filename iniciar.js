const { spawn } = require('child_process');

console.log('🚀 Iniciando Backend...\n');

// Iniciar backend
const backend = spawn('npm', ['run', 'start:dev'], {
  cwd: './backend',
  shell: true,
  stdio: 'inherit'
});

// Esperar 5 segundos y luego iniciar frontend
setTimeout(() => {
  console.log('\n🚀 Iniciando Frontend...\n');
  
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: './frontend',
    shell: true,
    stdio: 'inherit'
  });

  frontend.on('error', (err) => {
    console.error('Error al iniciar frontend:', err);
  });
}, 5000);

backend.on('error', (err) => {
  console.error('Error al iniciar backend:', err);
});

// Manejar Ctrl+C para cerrar ambos procesos
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo servidores...');
  backend.kill();
  process.exit();
});
