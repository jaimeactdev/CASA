// src/shared/components/Breadcrumb.tsx
'use client';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
// { /*aria-label="breadcrumb"  */}
export const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
  return (
    <Box
      component="nav"
     
      sx={{
        mb: 2,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      <Box
        component="ol"
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {items.map((item, i) => (
          <Box
            key={i}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {item.href ? (
              <Link href={item.href} passHref>
                <Typography
               
                  variant="body2"
                  color="text.primary"
                  sx={{
                    textDecoration: 'underline',
                    '&:hover': { textDecoration: 'none' },
                  }}
                >
                  {item.label}
                </Typography>
              </Link>
            ) : (
              <Typography
                variant="body2"
                color="primary"
                
               
              >
                {item.label}
              </Typography>
            )}

            {i < items.length - 1 && (
              <Typography
                variant="body2"
                sx={{ mx: 1, color: 'text.disabled' }}
              >
                |
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
