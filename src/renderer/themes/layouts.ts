export const layouts = {
  portrait: {
    window: {
      width: 400,
      height: 800
    },
    styles: {
      container: {
        maxWidth: '400px',
        minHeight: '100vh',
        padding: '2rem 1rem',
        gap: '1.5rem'
      },
      title: {
        fontSize: '2.5rem',
        marginBottom: '2rem'
      },
      image: {
        width: '150px',
        height: '150px',
        margin: '1rem auto'
      }
    }
  },
  landscape: {
    window: {
      width: 800,
      height: 600
    },
    styles: {
      container: {
        maxWidth: '800px',
        minHeight: '600px'
      },
      title: {
        fontSize: '2.2rem',
        marginBottom: '1.5rem'
      },
      image: {
        width: '120px',
        height: '120px'
      }
    }
  }
}; 