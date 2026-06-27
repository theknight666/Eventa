import re
import sys

with open('c:\\Users\\yuppp\\Downloads\\Eventa-main\\frontend\\src\\components\\Hero.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define Block A
block_a_regex = re.compile(
    r'(          <motion\.div\n'
    r'            initial={{ opacity: 0, y: 20 }}\n'
    r'            animate={{ opacity: 1, y: 0 }}\n'
    r'            transition={{ duration: 0\.7, ease }}\n'
    r'            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 mb-7"\n'
    r'          >\n'
    r'            <Sparkles size={14} className="text-foreground" />\n'
    r'            <span className="label-eyebrow text-foreground/80">AI-powered event discovery · India</span>\n'
    r'          </motion\.div>\n)',
    re.MULTILINE
)

# Define Block B
block_b_regex = re.compile(
    r'(            <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-2">\n'
    r'.*?            </div>\n)',
    re.DOTALL
)

match_a = block_a_regex.search(content)
match_b = block_b_regex.search(content)

if not match_a or not match_b:
    print("Could not find one of the blocks")
    sys.exit(1)

block_a_str = match_a.group(1)
block_b_str = match_b.group(1)

# Now swap them. But we need to fix indentation and wrappers.
# Block B moves to top: wrap it in a motion.div like block A, or just keep it as is but fix margin.
# Actually, if we just swap their positions:
# Remove block A
new_content = content[:match_a.start()] + '<!--BLOCK_A_HERE-->' + content[match_a.end():]

# In the new content, replace block B with block A
new_match_b = block_b_regex.search(new_content)
new_content = new_content[:new_match_b.start()] + block_a_str.replace(' mb-7', '').replace('          <motion.div', '            <motion.div').replace('          </motion.div>', '            </motion.div>') + new_content[new_match_b.end():]

# Now insert block B where block A was
# Remove 'mt-4' and add 'mb-7' to Block B's first line, and adjust indentation.
new_block_b = block_b_str.replace('mt-4 ', '').replace('px-2', 'px-2 mb-7')
# reduce indentation by 2 spaces for all lines
new_block_b = '\n'.join([line[2:] if line.startswith('  ') else line for line in new_block_b.split('\n')])

new_content = new_content.replace('<!--BLOCK_A_HERE-->', new_block_b)

with open('c:\\Users\\yuppp\\Downloads\\Eventa-main\\frontend\\src\\components\\Hero.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Swapped successfully.")
