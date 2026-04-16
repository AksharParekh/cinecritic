import { createTheme } from "@mui/material/styles";
import { colors } from "@mui/material";

export const themeModes = {
  dark: "dark",
  light: "light"
};

const themeConfigs = {
  custom: ({ mode }) => {
    const customPalette = mode === themeModes.dark ? {
      primary: {
        main: "#ff0000",
        contrastText: "#ffffff"
      },
      secondary: {
        main: "#f44336",
        contrastText: "#ffffff"
      },
      background: {
        default: "#000000",
        paper: "#131313"
      }
    } : {
      primary: {
        main: "#ff0000"
      },
      secondary: {
        main: "#f44336"
      },
      background: {
        default: colors.grey["100"],
      }
    };

    return createTheme({
      palette: {
        mode,
        ...customPalette
      },
      typography: {
        fontFamily: "Roboto, Helvetica, Arial, sans-serif",
        h5: {
          fontWeight: 700,
          letterSpacing: "0.2px"
        },
        h6: {
          fontWeight: 700,
          letterSpacing: "0.15px"
        },
        button: {
          fontWeight: 700,
          letterSpacing: "0.3px"
        }
      },
      components: {
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              fontFamily: "Roboto, Helvetica, Arial, sans-serif"
            }
          }
        },
        MuiTypography: {
          styleOverrides: {
            root: {
              fontFamily: "Roboto, Helvetica, Arial, sans-serif"
            }
          }
        }
      }
    });
  }
};

export default themeConfigs;