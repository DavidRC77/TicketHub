-- Script SQL para Vistas Optimizadas en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Vista para métricas de organizadores
CREATE OR REPLACE VIEW public.metricas_organizador AS
SELECT 
  p.id as organizador_id,
  COUNT(DISTINCT e.id) as eventos_activos,
  COUNT(DISTINCT en.id) as entradas_vendidas,
  COALESCE(SUM(DISTINCT e.precio), 0) as ingresos_total
FROM public.perfiles p
LEFT JOIN public.eventos e ON p.id = e.creado_por AND e.creado_por = p.id
LEFT JOIN public.entradas en ON e.id = en.evento_id
WHERE p.rol = 'organizador'
GROUP BY p.id;

-- Vista para métricas globales de administrador
CREATE OR REPLACE VIEW public.metricas_admin AS
SELECT 
  (SELECT COUNT(*) FROM public.perfiles WHERE rol = 'usuario') as usuarios_totales,
  (SELECT COUNT(*) FROM public.eventos) as eventos_totales,
  (SELECT COUNT(*) FROM public.entradas) as entradas_vendidas,
  COALESCE((SELECT SUM(precio) FROM public.eventos), 0) as ingresos_total;

-- Índices adicionales para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_eventos_creado_por_fecha ON public.eventos(creado_por, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_entradas_evento_usuario ON public.entradas(evento_id, usuario_id);

-- Función para obtener métricas por organizador (opcional)
CREATE OR REPLACE FUNCTION obtener_metricas_organizador(organizador_id UUID)
RETURNS TABLE (
  eventos_activos BIGINT,
  entradas_vendidas BIGINT,
  ingresos_total NUMERIC
) AS $$
  SELECT 
    COUNT(DISTINCT e.id),
    COUNT(DISTINCT en.id),
    COALESCE(SUM(e.precio), 0)
  FROM public.eventos e
  LEFT JOIN public.entradas en ON e.id = en.evento_id
  WHERE e.creado_por = organizador_id;
$$ LANGUAGE SQL;
