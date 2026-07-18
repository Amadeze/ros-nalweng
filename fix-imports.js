const fs = require('fs');
const path = require('path');

const base = 'F:/Roastery Operating System/ros-app';

// Fix PurchaseForm.tsx - remove unused imports
const pfPath = path.join(base, 'src/app/(dashboard)/inventory/_components/PurchaseForm.tsx');
let pf = fs.readFileSync(pfPath, 'utf8');

// Remove Select imports
pf = pf.replace(/import \{\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n\} from "@\/components\/ui\/select";\n/, '');
// Remove getCurrentDate
pf = pf.replace(/import \{ getCurrentDate, getTodayString \}/, 'import { getTodayString }');
// Remove Loader2
pf = pf.replace(/import \{ Loader2 \} from "lucide-react";\n/, '');

fs.writeFileSync(pfPath, pf, 'utf8');
console.log('Cleaned PurchaseForm.tsx');

// Fix PackagingPurchaseForm.tsx - remove unused imports
const ppfPath = path.join(base, 'src/app/(dashboard)/inventory/_components/PackagingPurchaseForm.tsx');
let ppf = fs.readFileSync(ppfPath, 'utf8');

// Remove Controller
ppf = ppf.replace(/import \{ useForm, Controller \}/, 'import { useForm }');
// Remove Textarea
ppf = ppf.replace(/import \{ Textarea \} from "@\/components\/ui\/textarea";\n/, '');
// Remove Select imports
ppf = ppf.replace(/import \{ Select, SelectContent, SelectItem, SelectTrigger, SelectValue \} from "@\/components\/ui\/select";\n/, '');
// Remove getCurrentDate
ppf = ppf.replace(/import \{ getCurrentDate, getTodayString \}/, 'import { getTodayString }');

fs.writeFileSync(ppfPath, ppf, 'utf8');
console.log('Cleaned PackagingPurchaseForm.tsx');
