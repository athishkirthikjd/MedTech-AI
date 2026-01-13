import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, MapPin, X, User, Ambulance } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockUsers } from "@/lib/mock-data";

export function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const emergencyContact = mockUsers.patient.emergencyContact;

  const handleEmergencyCall = () => {
    setIsCalling(true);
    // Simulate emergency call
    setTimeout(() => {
      setIsCalling(false);
      setIsConfirming(false);
    }, 3000);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-emergency text-emergency-foreground font-semibold shadow-lg sos-pulse"
      >
        <AlertTriangle className="w-4 h-4" />
        <span className="hidden sm:inline">SOS</span>
      </motion.button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emergency">
              <AlertTriangle className="w-5 h-5" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription>
              Use this feature only in case of a medical emergency. This will alert emergency services and your emergency contacts.
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!isConfirming && !isCalling && (
              <motion.div
                key="options"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 py-4"
              >
                {/* Emergency Contacts */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Emergency Contact
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{emergencyContact.name}</p>
                    <p className="text-muted-foreground">{emergencyContact.relationship}</p>
                    <p className="text-muted-foreground">{emergencyContact.phone}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Your Location
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Location sharing will be enabled when you confirm the emergency call.
                  </p>
                </div>

                {/* Warning Banner */}
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
                  <p className="text-sm text-warning font-medium">
                    ⚠️ This feature is for real medical emergencies only. Misuse may result in legal consequences.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => setIsConfirming(true)}
                  >
                    <Phone className="w-4 h-4" />
                    Call Emergency
                  </Button>
                </div>
              </motion.div>
            )}

            {isConfirming && !isCalling && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-8 text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-emergency/10 flex items-center justify-center">
                  <Ambulance className="w-10 h-10 text-emergency" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Confirm Emergency Call</h3>
                  <p className="text-muted-foreground text-sm">
                    This will immediately alert emergency services and share your location.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsConfirming(false)}
                  >
                    Go Back
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={handleEmergencyCall}
                  >
                    <Phone className="w-4 h-4" />
                    Confirm Call
                  </Button>
                </div>
              </motion.div>
            )}

            {isCalling && (
              <motion.div
                key="calling"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 text-center space-y-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-24 h-24 mx-auto rounded-full bg-emergency flex items-center justify-center"
                >
                  <Phone className="w-12 h-12 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Calling Emergency Services...</h3>
                  <p className="text-muted-foreground">
                    Please stay on the line. Help is on the way.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-success">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Location shared</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
