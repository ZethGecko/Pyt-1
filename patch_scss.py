#!/usr/bin/env python3
"""Patch canvas-inspeccion SCSS to add design-actions-bar after .btn-opcion block."""

from pathlib import Path

scss_path = Path('/home/zeth/Documentos/proyectos/test01/Pyt-1/frontend/src/app/modules/inspecciones/pages/canvas-inspeccion.component.scss')
content = scss_path.read_text()

# Find the exact end of .btn-opcion block: the line "  }" that closes .btn-opcion
# After restoration: lines 1050-1066 = .btn-opcion > &active block, line 1066 = closes .btn-opcion
closing_line = "  }\n"  # from original, found after .btn-opcion > &.active

# Find unique context before closing_line
old_exact = """        &.btn-mal {
          background: $color-danger;
          color: white;
          border-color: $color-danger;
       }
     }
  }"""

new_replacement = """        &.btn-mal {
          background: $color-danger;
          color: white;
          border-color: $color-danger;
       }
     }
   }

  // ========== BARRA DE ACCIONES DEL EDITOR DE FORMATO ==========
  .design-actions-bar {
    padding: 1rem 1.5rem;
    background: $color-card-bg;
    border-bottom: 1px solid $color-border;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .design-actions-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .design-actions-spacer {
    flex: 1;
  }

  .design-actions-bar .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    border-radius: $radius-md;
    font-size: 0.9375rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 18px;
      height: 18px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .design-actions-bar .btn-outline {
    background: white;
    color: $color-text-primary;
    border: 1px solid $color-border;

    &:hover:not(:disabled) {
      background: $color-bg;
      border-color: $color-secondary;
    }
  }

  .design-actions-bar .btn-primary {
    background: $color-primary;
    color: white;

    &:hover:not(:disabled) {
      background: $color-primary-dark;
      box-shadow: 0 2px 8px rgba($color-primary, 0.4);
    }
  }
}"""

count = content.count(old_exact)
print(f"Found exact match count: {count}")
if count != 1:
    print("ERROR: expected exactly 1 match")
else:
    content = content.replace(old_exact, new_replacement, count=1)
    scss_path.write_text(content)
    print("SCSS patched successfully.")

    # Verify brace balance
    depth = 0
    for line in content.splitlines():
        depth += line.count('{') - line.count('}')
    print(f"Final brace depth: {depth}")
