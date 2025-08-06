import type { MDXComponents } from 'mdx/types';
import { PlatformLink } from './components/platform-link';
import { ExternalLink } from './components/external-link';
import { Mermaid } from './components/mermaid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { mdxComponents } from './components/mdx-components';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
    PlatformLink,
    ExternalLink,
    Mermaid,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  };
}
