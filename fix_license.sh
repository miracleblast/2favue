#!/bin/bash
# Remove particle imports
sed -i '/ParticleBackground/d' src/views/LicenseView.vue
sed -i '/components\/effects/d' src/views/LicenseView.vue
sed -i '/ParticlesBackground/d' src/views/LicenseView.vue

# Remove from template if any
sed -i '/<ParticleBackground/d' src/views/LicenseView.vue
sed -i '/<ParticlesBackground/d' src/views/LicenseView.vue

echo "✅ LicenseView.vue cleaned up!"
