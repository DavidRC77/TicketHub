DROP TABLE IF EXISTS public.entradas CASCADE;
DROP TABLE IF EXISTS public.eventos CASCADE;
DROP TABLE IF EXISTS public.perfiles CASCADE;

CREATE TABLE public.perfiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  correo text UNIQUE NOT NULL,
  nombre_completo text,
  rol text NOT NULL CHECK (rol IN ('admin', 'organizador', 'usuario')) DEFAULT 'usuario',
  creado_at timestamp with time zone DEFAULT now(),
  actualizado_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  categoria text NOT NULL,
  ubicacion text NOT NULL,
  fecha timestamp with time zone NOT NULL,
  precio numeric(10, 2) NOT NULL DEFAULT 0.00,
  calificacion numeric(2, 1) DEFAULT 5.0,
  url_imagen text,
  total_entradas integer NOT NULL,
  entradas_disponibles integer NOT NULL,
  creado_por uuid NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  creado_at timestamp with time zone DEFAULT now(),
  actualizado_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.entradas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  estado text NOT NULL CHECK (estado IN ('activo', 'usado')) DEFAULT 'activo',
  creado_at timestamp with time zone DEFAULT now(),
  actualizado_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_perfiles_correo ON public.perfiles(correo);
CREATE INDEX idx_perfiles_rol ON public.perfiles(rol);
CREATE INDEX idx_eventos_creado_por ON public.eventos(creado_por);
CREATE INDEX idx_eventos_fecha ON public.eventos(fecha);
CREATE INDEX idx_eventos_categoria ON public.eventos(categoria);
CREATE INDEX idx_entradas_evento_id ON public.entradas(evento_id);
CREATE INDEX idx_entradas_usuario_id ON public.entradas(usuario_id);
CREATE INDEX idx_entradas_estado ON public.entradas(estado);

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entradas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfiles_leer_propio" ON public.perfiles
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'authenticated');

CREATE POLICY "perfiles_actualizar_propio" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "eventos_leer_todos" ON public.eventos
  FOR SELECT USING (true);

CREATE POLICY "eventos_insertar_autorizados" ON public.eventos
  FOR INSERT WITH CHECK (
    auth.uid() = creado_por AND 
    EXISTS (
      SELECT 1 FROM public.perfiles 
      WHERE id = auth.uid() AND rol IN ('admin', 'organizador')
    )
  );

CREATE POLICY "eventos_actualizar_propios_o_admin" ON public.eventos
  FOR UPDATE USING (
    auth.uid() = creado_por OR 
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "eventos_borrar_propios_o_admin" ON public.eventos
  FOR DELETE USING (
    auth.uid() = creado_por OR 
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "entradas_leer_autorizados" ON public.entradas
  FOR SELECT USING (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.eventos 
      WHERE id = evento_id AND (creado_por = auth.uid() OR EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
      ))
    )
  );

CREATE POLICY "entradas_insertar_usuario" ON public.entradas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "entradas_actualizar_autorizados" ON public.entradas
  FOR UPDATE USING (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.eventos 
      WHERE id = evento_id AND (creado_por = auth.uid() OR EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
      ))
    )
  );