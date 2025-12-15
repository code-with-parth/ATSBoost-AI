-- Update the handle_new_user function to also create a subscription entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.plans (user_id, plan_type)
  VALUES (new.id, 'free');
  
  -- Create a subscription entry for the user (stripe_customer_id will be set on first upgrade)
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (new.id, 'free', 'active');
  
  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
