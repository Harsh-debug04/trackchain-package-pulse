-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    display_name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create packages table
CREATE TABLE public.packages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id TEXT NOT NULL UNIQUE,
    sender_name TEXT NOT NULL,
    sender_address TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_address TEXT NOT NULL,
    current_stage TEXT NOT NULL DEFAULT 'Package Created',
    seal_status TEXT NOT NULL DEFAULT 'Intact',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Create policies for packages
CREATE POLICY "Packages are viewable by everyone" 
ON public.packages 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create packages" 
ON public.packages 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update packages" 
ON public.packages 
FOR UPDATE 
TO authenticated
USING (true);

-- Create package_updates table for tracking updates
CREATE TABLE public.package_updates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    seal_status TEXT NOT NULL,
    updated_by UUID NOT NULL REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on package_updates
ALTER TABLE public.package_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for package_updates
CREATE POLICY "Package updates are viewable by everyone" 
ON public.package_updates 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create package updates" 
ON public.package_updates 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = updated_by);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON public.packages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();