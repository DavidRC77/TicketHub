const fs = require('fs');

let eventModel = fs.readFileSync('src/models/Event.ts', 'utf8');
eventModel = eventModel.replace(
  /export const createEvent = async \([\s\S]*?\): Promise<Event \| null> => \{[\s\S]*?const \{ data, error \} = await supabase[\s\S]*?\.from\('events'\)[\s\S]*?\.insert\(\[[\s\S]*?\}\,[\s\S]*?\]\)[\s\S]*?\.select\(\)[\s\S]*?\.single\(\);/m,
  "export const createEvent = async (\n  titulo: string,\n  descripcion: string,\n  fecha: string,\n  ubicacion: string,\n  categoria: string,\n  precio: number,\n  total_entradas: number,\n  creado_por: string\n): Promise<Event | null> => {\n  const { data, error } = await supabase\n    .from('eventos')\n    .insert([\n      {\n        titulo,\n        descripcion,\n        fecha,\n        ubicacion,\n        categoria,\n        precio,\n        total_entradas,\n        entradas_disponibles: total_entradas,\n        creado_por,\n      },\n    ])\n    .select()\n    .single();"
);
eventModel = eventModel.replace(
  /if \(updates\.date\) updateData\.fecha = updates\.date\.toISOString\(\);/g,
  "if (updates.date) updateData.fecha = new Date(updates.date).toISOString();"
);
fs.writeFileSync('src/models/Event.ts', eventModel);


let controller = fs.readFileSync('src/controllers/eventoControlador.ts', 'utf8');
controller = controller.replace(
  /export const createNewEvent = async \([\s\S]*?\): Promise<ApiResponse<Event>> => \{[\s\S]*?if \(!isOrganizer\(userRole\)\) \{/,
  "export const createNewEvent = async (\n  titulo: string,\n  descripcion: string,\n  fecha: string,\n  ubicacion: string,\n  categoria: string,\n  precio: number,\n  total_entradas: number,\n  userId: string,\n  userRole: UserRole\n): Promise<ApiResponse<Event>> => {\n  if (!isOrganizer(userRole)) {"
);
controller = controller.replace(
  /const evento = await createEvent\(title, description, date, totalTickets, userId\);/,
  "const evento = await createEvent(titulo, descripcion, fecha, ubicacion, categoria, precio, total_entradas, userId);"
);
fs.writeFileSync('src/controllers/eventoControlador.ts', controller);


let route = fs.readFileSync('src/app/api/events/route.ts', 'utf8');
route = route.replace(
  /const result = await createNewEvent\([\s\S]*?\);/,
  "const result = await createNewEvent(\n    body.titulo,\n    body.descripcion,\n    body.fecha,\n    body.ubicacion,\n    body.categoria,\n    body.precio,\n    body.total_entradas,\n    body.userId,\n    body.userRole\n  );"
);
fs.writeFileSync('src/app/api/events/route.ts', route);

let f = fs.readFileSync('src/components/DashboardOrganizador.tsx', 'utf8');
f = f.replace(/calificacion: '5.0',[\s\S]*?\}\);/g, "calificacion: '5.0',\n    fecha: '',\n    ubicacion: '',\n    precio: '',\n    total_entradas: '',\n    descripcion: ''\n  });");
f = f.replace(/titulo: '', categoria: 'Otro', url_imagen: '', calificacion: '5.0' /g, "titulo: '', categoria: 'Otro', url_imagen: '', calificacion: '5.0', fecha: '', ubicacion: '', precio: '', total_entradas: '', descripcion: '' ");

f = f.replace(/const \[editandoEvento, setEditandoEvento\] = useState<Evento \| null>\(null\);/g, "const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);\n\n  async function guardarEvento() {\n    if (!formularioEvento.titulo || !formularioEvento.fecha || !formularioEvento.ubicacion || !formularioEvento.categoria || !formularioEvento.precio || !formularioEvento.total_entradas || !formularioEvento.descripcion) {\n      alert('Por favor complete todos los campos requeridos');\n      return;\n    }\n\n    const payload = {\n      ...formularioEvento,\n      precio: parseFloat(formularioEvento.precio),\n      total_entradas: parseInt(formularioEvento.total_entradas),\n      userId: usuario.id,\n      userRole: usuario.rol\n    };\n\n    if (editandoEvento) {\n      const res = await fetch('/api/events', {\n        method: 'PUT',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({\n          eventId: editandoEvento.id,\n          updates: {\n            title: payload.titulo,\n            description: payload.descripcion,\n            date: payload.fecha,\n            location: payload.ubicacion,\n            category: payload.categoria,\n            price: payload.precio,\n            totalTickets: payload.total_entradas\n          },\n          userId: usuario.id,\n          userRole: usuario.rol\n        })\n      });\n      if (res.ok) location.reload();\n    } else {\n      const res = await fetch('/api/events', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(payload)\n      });\n      if (res.ok) location.reload();\n      else { const e = await res.json(); alert('Error: ' + e.error); }\n    }\n  }\n");

f = f.replace(/<button\s*type="button"\s*className=\{`rounded-lg px-4 py-2 text-white font-medium \$\{glassStyles\.botonPrimario\}`\}\s*>\s*Guardar cambios\s*<\/button>/g, "\n              <button\n                type=\"button\"\n                onClick={guardarEvento}\n                className={\"rounded-lg px-4 py-2 text-white font-medium \" + glassStyles.botonPrimario}\n              >\n                Guardar cambios\n              </button>");

f = f.replace(/<input\s*value=\{formularioEvento\.url_imagen\}[\s\S]*?<input\s*value=\{formularioEvento\.calificacion\}/, "<input\n                value={formularioEvento.fecha}\n                onChange={(e) => setFormularioEvento({ ...formularioEvento, fecha: e.target.value })}\n                type=\"datetime-local\"\n                placeholder=\"Fecha\"\n                className=\"bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50\"\n              />\n              <input\n                value={formularioEvento.ubicacion}\n                onChange={(e) => setFormularioEvento({ ...formularioEvento, ubicacion: e.target.value })}\n                placeholder=\"Ubicación\"\n                className=\"bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50\"\n              />\n              <input\n                value={formularioEvento.precio}\n                onChange={(e) => setFormularioEvento({ ...formularioEvento, precio: e.target.value })}\n                type=\"number\"\n                placeholder=\"Precio\"\n                className=\"bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50\"\n              />\n              <input\n                value={formularioEvento.total_entradas}\n                onChange={(e) => setFormularioEvento({ ...formularioEvento, total_entradas: e.target.value })}\n                type=\"number\"\n                placeholder=\"Total Entradas\"\n                className=\"bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50\"\n              />\n              <textarea\n                value={formularioEvento.descripcion}\n                onChange={(e) => setFormularioEvento({ ...formularioEvento, descripcion: e.target.value })}\n                placeholder=\"Descripción\"\n                className=\"bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 md:col-span-2\"\n              />\n              <input\n                value={formularioEvento.calificacion}");

f = f.replace(/<button className="text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors">/g, "<button onClick={() => { setEditandoEvento(evento); setFormularioEvento({ titulo: evento.titulo, categoria: evento.categoria, url_imagen: evento.url_imagen || '', calificacion: evento.calificacion ? evento.calificacion.toString() : '5.0', fecha: evento.fecha, ubicacion: 'Sin ubicación', precio: evento.precio.toString(), total_entradas: evento.total_entradas.toString(), descripcion: '' }); }} className=\"text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors\">");

fs.writeFileSync('src/components/DashboardOrganizador.tsx', f);
console.log('Done!');
