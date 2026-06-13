const fs = require('fs');

let c = fs.readFileSync('src/components/Navbar.jsx', 'utf8');

c = c.replace(/const router = useRouter\(\);\s+const router = useRouter\(\);/g, 'const router = useRouter();');

c = c.replace(/const searchParams = new URLSearchParams\(location\.search\);[\s\S]*?\}, \[location\.search, navigate, router\.pathname\]\);/,
`if (router.query.login === 'true') {
      setLoginOpen(true);
      const { login, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  }, [router.query, router.pathname]);`);

fs.writeFileSync('src/components/Navbar.jsx', c);
