CREATE POLICY "No direct browser access to app settings"
ON public.app_settings
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct browser access to page events"
ON public.page_events
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct browser access to sales"
ON public.sales
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);