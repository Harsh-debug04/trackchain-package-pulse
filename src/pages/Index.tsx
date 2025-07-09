import { useState, useEffect } from "react";
import { Shield, Zap, Package, ArrowRight, Users, Lock, Globe, Activity, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Tamper-Proof Security",
      description: "Every package update is recorded immutably on the Ethereum blockchain, ensuring complete data integrity.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Real-Time Tracking",
      description: "Live updates with instant blockchain confirmations provide transparent, up-to-the-second package status.",
      color: "text-accent"
    },
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "Military-grade encryption protects sensitive package data throughout the entire supply chain.",
      color: "text-success"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Seamlessly track packages across international borders with unified blockchain verification.",
      color: "text-warning"
    }
  ];

  const stats = [
    { label: "Packages Tracked", value: "1.2M+", icon: Package },
    { label: "Blockchain Transactions", value: "567K+", icon: Activity },
    { label: "Supply Chain Partners", value: "2,500+", icon: Users },
    { label: "Countries Covered", value: "45+", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-background blockchain-grid overflow-hidden">
      {/* Auth Header */}
      <div className="fixed top-0 right-0 z-50 p-4">
        {user ? (
          <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Welcome back!</span>
            </div>
            <Button 
              onClick={signOut} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline"
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-blockchain opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">
              Powered by Ethereum Blockchain
            </Badge>
            
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 gradient-text leading-tight">
              Avikshipt
              <br />
              <span className="text-4xl lg:text-5xl text-foreground">Package Tracking</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Revolutionary blockchain-powered supply chain transparency. Track every package movement 
              with immutable security, real-time updates, and complete audit trails on Ethereum.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                onClick={() => navigate('/consumer')}
                variant="blockchain"
                size="xl"
                className="group"
              >
                <Package className="w-6 h-6 mr-3 group-hover:animate-float" />
                Track Your Package
                <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                onClick={() => navigate('/manager')}
                variant="accent"
                size="xl"
                className="group"
              >
                <Shield className="w-6 h-6 mr-3 group-hover:animate-float" />
                Manager Dashboard
                <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`text-center transition-all duration-700 delay-${index * 100} ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary animate-float" />
                  <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
              Next-Generation Security
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built on enterprise-grade blockchain technology with advanced cryptographic security 
              and real-time transparency for the modern supply chain.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`blockchain-card group cursor-pointer transition-all duration-500 delay-${index * 100} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-primary flex items-center justify-center neon-glow group-hover:animate-pulse-glow">
                      <feature.icon className={`w-8 h-8 text-primary-foreground`} />
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 gradient-text">
              Blockchain Infrastructure
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="blockchain-card text-center">
                <Activity className="w-16 h-16 text-primary mx-auto mb-4 animate-float" />
                <h3 className="text-xl font-bold mb-2">Smart Contracts</h3>
                <p className="text-muted-foreground">
                  Automated verification and execution of supply chain protocols
                </p>
              </div>
              
              <div className="blockchain-card text-center">
                <Zap className="w-16 h-16 text-accent mx-auto mb-4 animate-float" />
                <h3 className="text-xl font-bold mb-2">Gas Optimization</h3>
                <p className="text-muted-foreground">
                  Efficient transaction processing with minimal blockchain fees
                </p>
              </div>
              
              <div className="blockchain-card text-center">
                <Shield className="w-16 h-16 text-success mx-auto mb-4 animate-float" />
                <h3 className="text-xl font-bold mb-2">Decentralized Security</h3>
                <p className="text-muted-foreground">
                  Distributed network protection against single points of failure
                </p>
              </div>
            </div>

            <div className="connection-indicator bg-gradient-primary/10 rounded-2xl p-8 border border-primary/20">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-4 h-4 bg-success rounded-full animate-pulse-glow"></div>
                <span className="text-lg font-semibold">Live Ethereum Network Connection</span>
              </div>
              <p className="text-muted-foreground">
                Connected to Ganache local development network for testing and demonstration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 gradient-text">
              Ready to Secure Your Supply Chain?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the future of package tracking with blockchain-powered transparency and security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/consumer')}
                variant="blockchain"
                size="xl"
                className="group"
              >
                <Package className="w-6 h-6 mr-3" />
                Start Tracking
                <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                onClick={() => navigate('/manager')}
                variant="outline"
                size="xl"
                className="group border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Shield className="w-6 h-6 mr-3" />
                Manager Access
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
