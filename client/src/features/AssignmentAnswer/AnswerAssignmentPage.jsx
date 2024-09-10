import React from 'react';
import { Grid, Paper, Box, Tabs, Tab } from '@mui/material';
import { Editor } from '@monaco-editor/react';

function AnswerAssignmentPage() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper sx={{ p: 2, height: '100vh' }}>
            {/* File Tree */}
            <Box sx={{ height: '100%' }}>
              <Tabs
                orientation="vertical"
                value={value}
                onChange={handleChange}
                aria-label="file tabs"
                variant="scrollable"
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                <Tab label="index.html" />
                <Tab label="styles.css" />
                <Tab label="index.js" />
              </Tabs>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Paper sx={{ p: 2, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid item xs={6} sx={{ height: '100%' }}>
                {/* Code Editor */}
                <Editor
                  height="100%"
                  defaultLanguage={value === 0 ? 'html' : value === 1 ? 'css' : 'javascript'}
                  defaultValue={value === 0 ? '<!-- index.html -->' : value === 1 ? '/* styles.css */' : '// index.js'}
                  theme="vs-dark"
                />
              </Grid>
              <Grid item xs={6} sx={{ height: '100%' }}>
                {/* Preview Frame */}
                <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <iframe
                    title="Preview"
                    style={{ width: '100%', height: '100%' }}
                    srcDoc={value === 0 ? '<!-- Preview Content -->' : value === 1 ? '<!-- Preview Content -->' : '<!-- Preview Content -->'}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnswerAssignmentPage;
