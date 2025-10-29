for file in src/components/ui/*.tsx; do pnpx shadcn@latest add -y --overwrite $(basename "$file" .tsx); done
