import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  CircularProgress, 
  IconButton, 
  Tooltip, 
  Fade,
  useTheme,
  alpha
} from "@mui/material";
import { Person, School, ContentCopy, Check, ArrowForward } from '@mui/icons-material';
import { useGetUserMutation } from '../../features/LoginRegister/userService'; 
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

function StudentClassContainer() {
  const navigate = useNavigate();
  const theme = useTheme();
  const userClass = useSelector((state) => state.class.class);
  const classId = userClass[0]?._id || userClass?._id;
  const [getUser] = useGetUserMutation();
  const [teacherName, setTeacherName] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchClassDetails = async () => {
      setIsLoading(true);
      try {
        if (userClass.teacher) {
          const teacherData = await getUser(userClass.teacher).unwrap();
          setTeacherName(teacherData[0].username);
        }
        setStudentCount(userClass.students?.length || 0);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [userClass, getUser]);

  function handleClick() {
    navigate(`/studentClass/${classId}/classHome`);
  }

  const handleCopyInviteCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(userClass.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <MotionCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        sx={{
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
          background: theme.palette.background.paper,
        }}
      >
        <MotionBox
          initial={{ backgroundPosition: "0% 50%" }}
          animate={{ backgroundPosition: "100% 50%" }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 10,
            ease: "linear"
          }}
          sx={{
            background: `linear-gradient(135deg, #6e61ab 0%, #4b3987 25%, #6e61ab 50%, #4b3987 75%, #6e61ab 100%)`,
            backgroundSize: "200% 200%",
            color: "#fff",
            p: 4,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
              transform: "rotate(30deg)",
            },
          }}
        >
          <MotionTypography 
            variant="h4" 
            component="div" 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            sx={{ fontWeight: "bold", mb: 2, position: "relative" }}
          >
            {userClass[0]?.className || userClass?.className}
          </MotionTypography>
          <MotionTypography 
            variant="body1" 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 3, position: "relative" }}
          >
            Embark on a journey of knowledge and discovery
          </MotionTypography>

          {/* Again removed for student not to know if the teacher changed the invitecode , only way to know is for the teacher to give them their invite codes. */}

          {/* <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
            <Chip
              icon={<School sx={{ color: "#fff !important" }} />}
              label={`Invite Code: ${userClass.inviteCode}`}
              sx={{
                color: "#fff",
                bgcolor: alpha(theme.palette.background.paper, 0.2),
                mr: 1,
                '& .MuiChip-icon': { color: '#fff' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 0.3),
                }
              }}
            />
            <Tooltip title={copied ? "Copied!" : "Copy Invite Code"} TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
              <IconButton 
                onClick={handleCopyInviteCode} 
                size="small" 
                sx={{ 
                  color: "#fff",
                  bgcolor: alpha(theme.palette.background.paper, 0.2),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.3),
                  }
                }}
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={copied ? 'check' : 'copy'}
                    initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {copied ? <Check /> : <ContentCopy />}
                  </motion.div>
                </AnimatePresence>
              </IconButton>
            </Tooltip>
          </Box> */}
        </MotionBox>
        <CardContent sx={{ bgcolor: "#fff", p: 4 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <MotionBox 
              display="flex" 
              alignItems="center"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Person sx={{ mr: 1, color: theme.palette.primary.main, flexShrink: 0 }} />
              <Typography variant="body1" color="text.primary">
                <strong>{studentCount}</strong> Students
              </Typography>
            </MotionBox>
            <MotionBox 
              display="flex" 
              alignItems="center"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <School sx={{ mr: 1, color: theme.palette.secondary.main, flexShrink: 0 }} />
              <Tooltip title={teacherName} placement="top">
                <Typography 
                  variant="body1" 
                  color="text.primary" 
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 'calc(100% - 28px)',
                  }}
                >
                  Teacher: <strong>{teacherName}</strong>
                </Typography>
              </Tooltip>
            </MotionBox>
          </Box>
          <MotionBox 
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0, 
              height: isHovered ? 'auto' : 0,
              transition: { duration: 0.3, ease: "easeInOut" }
            }}
            sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: theme.palette.grey[100], 
              borderRadius: "12px",
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              View detailed class information
            </Typography>
            <ArrowForward sx={{ color: theme.palette.primary.main }} />
          </MotionBox>
        </CardContent>
      </MotionCard>
    </div>
  );
}

export default StudentClassContainer;