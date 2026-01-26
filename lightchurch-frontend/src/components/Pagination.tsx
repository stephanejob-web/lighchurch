import { Box, Pagination as MuiPagination, Typography } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  itemsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  total,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = total && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem =
    total && itemsPerPage ? Math.min(currentPage * itemsPerPage, total) : 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        py: 3,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {/* Info */}
      {total && itemsPerPage && (
        <Typography variant="body2" color="text.secondary">
          Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur{' '}
          <strong>{total}</strong> résultats
        </Typography>
      )}

      {/* Pagination Controls */}
      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => onPageChange(page)}
        variant="outlined"
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        siblingCount={1}
        boundaryCount={1}
        sx={{
          '& .MuiPaginationItem-root': {
            fontWeight: 500,
            borderColor: 'rgba(99, 102, 241, 0.3)',
            '&:hover': {
              borderColor: 'rgba(99, 102, 241, 0.6)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
            '&.Mui-selected': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
              },
            },
          },
        }}
      />
    </Box>
  );
}
